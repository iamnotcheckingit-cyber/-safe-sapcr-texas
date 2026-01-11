// Netlify Function to send emails via Resend
exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Resend API key not configured' })
    };
  }

  try {
    const { recipients, subject, html } = JSON.parse(event.body);

    if (!recipients || !subject || !html) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Missing required fields' })
      };
    }

    // Send emails in batches of 50
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      // Send to each recipient individually (Resend free tier)
      for (const recipient of batch) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
            to: recipient.email,
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0;">SAFE SAPCR Texas</h1>
                </div>
                <div style="padding: 30px; background: #ffffff;">
                  <p>Dear ${recipient.name},</p>
                  ${html}
                </div>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                  <p>You're receiving this because you joined SAFE SAPCR Texas.</p>
                  <p><a href="https://safesapcrtx.org">safesapcrtx.org</a></p>
                </div>
              </div>
            `
          })
        });

        const result = await response.json();
        results.push({ email: recipient.email, success: response.ok, result });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        total: recipients.length
      })
    };

  } catch (error) {
    console.error('Email error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
