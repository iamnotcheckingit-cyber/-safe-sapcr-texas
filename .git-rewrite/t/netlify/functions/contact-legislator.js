// Netlify Function to send emails to legislators via Resend
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method Not Allowed' }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Email service not configured' })
    };
  }

  try {
    const {
      legislatorName,
      legislatorEmail,
      senderName,
      senderEmail,
      senderCity,
      senderPhone,
      subject,
      message,
      sendCopy
    } = JSON.parse(event.body);

    // Validate required fields
    if (!legislatorEmail || !senderName || !senderEmail || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Missing required fields' })
      };
    }

    // Validate email format
    if (!senderEmail.includes('@') || !legislatorEmail.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid email format' })
      };
    }

    // Format the message for the legislator
    const formattedMessage = message
      .replace('[YOUR_NAME]', senderName)
      .replace('[YOUR_CITY]', senderCity);

    // Create HTML email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background: #f5f5f5; padding: 15px 20px; border-bottom: 3px solid #1a365d;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            This message was sent via SAFE SAPCR Texas constituent contact form
          </p>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #1a365d; margin-top: 0;">Message from a Texas Constituent</h2>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0 0 5px;"><strong>From:</strong> ${senderName}</p>
            <p style="margin: 0 0 5px;"><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
            <p style="margin: 0 0 5px;"><strong>City:</strong> ${senderCity}, Texas</p>
            ${senderPhone ? `<p style="margin: 0;"><strong>Phone:</strong> ${senderPhone}</p>` : ''}
          </div>

          <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
${formattedMessage}
          </div>
        </div>
        <div style="background: #f5f5f5; padding: 15px 20px; font-size: 11px; color: #666; text-align: center;">
          <p style="margin: 0;">
            Sent via <a href="https://safesapcrtx.org" style="color: #1a365d;">SAFE SAPCR Texas</a> constituent contact form
          </p>
        </div>
      </div>
    `;

    // Send email to legislator
    const legislatorResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
        to: legislatorEmail,
        reply_to: senderEmail,
        subject: subject || 'Constituent Message: Support for SAFE SAPCR Act',
        html: emailHtml
      })
    });

    if (!legislatorResponse.ok) {
      const error = await legislatorResponse.json();
      console.error('Failed to send to legislator:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Failed to send email to legislator' })
      };
    }

    // Send copy to constituent if requested
    if (sendCopy) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
          to: senderEmail,
          subject: `Copy: Your message to ${legislatorName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1a365d, #2c5282); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 20px;">SAFE SAPCR Texas</h1>
              </div>
              <div style="padding: 30px; background: #ffffff;">
                <h2 style="color: #1a365d; margin-top: 0;">Your Message Has Been Sent</h2>
                <p>Thank you for contacting ${legislatorName}! Here's a copy of your message:</p>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1a365d;">
                  <p style="margin: 0 0 10px;"><strong>To:</strong> ${legislatorName}</p>
                  <p style="margin: 0 0 10px;"><strong>Subject:</strong> ${subject}</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                  <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">${formattedMessage}</div>
                </div>

                <p style="color: #666; font-size: 14px;">
                  <strong>What happens next?</strong><br>
                  Legislative offices receive many messages. Your email has been sent directly to the legislator's official email address.
                  Response times vary, but your voice has been heard. Consider following up with a phone call for urgent matters.
                </p>

                <div style="text-align: center; margin-top: 20px;">
                  <a href="https://safesapcrtx.org/legislators" style="display: inline-block; background: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact More Legislators</a>
                </div>
              </div>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                <p style="margin: 0;"><a href="https://safesapcrtx.org" style="color: #1a365d;">safesapcrtx.org</a></p>
              </div>
            </div>
          `
        })
      });
    }

    // Also notify SAFE SAPCR for tracking
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
        to: 'info@safesapcrtx.org',
        subject: `Legislator Contact: ${legislatorName}`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Constituent Contacted Legislator</h2>
            <p><strong>Legislator:</strong> ${legislatorName} (${legislatorEmail})</p>
            <p><strong>Constituent:</strong> ${senderName}</p>
            <p><strong>City:</strong> ${senderCity}</p>
            <p><strong>Email:</strong> ${senderEmail}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `
      })
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Message sent successfully' })
    };

  } catch (error) {
    console.error('Contact legislator error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
