const { Resend } = require('resend');

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Parse request body
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { recipients, subject, htmlBody, bcc } = body;

    if (!recipients || !subject || !htmlBody) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: recipients, subject, htmlBody' }) };
    }

    const results = [];
    const errors = [];

    // Send emails one by one with delay to avoid rate limiting
    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        try {
            const emailPayload = {
                from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
                to: recipient.email,
                subject: subject,
                html: htmlBody.replace('{{outlet}}', recipient.outlet || 'News Desk')
            };

            // Add BCC if provided
            if (bcc) {
                emailPayload.bcc = bcc;
            }

            const result = await resend.emails.send(emailPayload);
            results.push({ email: recipient.email, success: true, id: result.data?.id });

            // Add delay between emails to avoid rate limiting
            if (i < recipients.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        } catch (error) {
            errors.push({ email: recipient.email, error: error.message });
        }
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sent: results.length,
            failed: errors.length,
            results,
            errors
        })
    };
};
