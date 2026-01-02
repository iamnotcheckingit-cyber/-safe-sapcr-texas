// Netlify Function to handle newsletter signups
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
    const { email } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Valid email required' })
      };
    }

    // Send welcome email to the subscriber
    const welcomeResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
        to: email,
        subject: 'Welcome to SAFE SAPCR Texas Updates',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a365d, #2c5282); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">SAFE SAPCR Texas</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Service Accountability and Fraud Elimination</p>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1a365d; margin-top: 0;">Thank You for Joining Us!</h2>
              <p>You're now subscribed to receive updates from SAFE SAPCR Texas. We'll keep you informed about:</p>
              <ul style="line-height: 1.8;">
                <li>Legislative updates on the SAFE SAPCR Act</li>
                <li>Advocacy opportunities and events</li>
                <li>Resources for affected families</li>
                <li>Progress on family law reform in Texas</li>
              </ul>
              <p>Together, we can reform Texas family law to protect parents and children from fraudulent default judgments.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://safesapcrtx.org/legislators" style="display: inline-block; background: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Your Legislator</a>
              </div>
              <p style="color: #666; font-size: 14px;">Questions? Reply to this email or contact us at info@safesapcrtx.org</p>
            </div>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p>You're receiving this because you subscribed at safesapcrtx.org</p>
              <p><a href="https://safesapcrtx.org" style="color: #1a365d;">safesapcrtx.org</a></p>
            </div>
          </div>
        `
      })
    });

    // Also notify the admin of new signup
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
        to: 'info@safesapcrtx.org',
        subject: 'New Newsletter Subscriber',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>New Newsletter Signup</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Source:</strong> safesapcrtx.org newsletter form</p>
          </div>
        `
      })
    });

    if (!welcomeResponse.ok) {
      const error = await welcomeResponse.json();
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Failed to send welcome email' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Subscribed successfully' })
    };

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
