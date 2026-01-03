// Netlify Function to send custom emails
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email service not configured' }) };
    }

    try {
        const { recipients, cc, subject, body, from_name } = JSON.parse(event.body);

        const results = [];

        for (const to of recipients) {
            const emailPayload = {
                from: `${from_name || 'SAFE SAPCR Texas'} <info@safesapcrtx.org>`,
                to: to,
                subject: subject,
                html: body
            };

            if (cc && cc.length > 0) {
                emailPayload.cc = cc;
            }

            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailPayload)
            });

            const result = await response.json();
            results.push({ to, success: response.ok, result });
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, results })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
