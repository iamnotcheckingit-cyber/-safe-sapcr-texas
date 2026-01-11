// Netlify Function to notify admin of new membership signups
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
      email,
      first_name,
      last_name,
      phone,
      city,
      county,
      involvement,
      experience,
      legislative_updates,
      newsletter
    } = JSON.parse(event.body);

    // Send notification to admin
    const adminResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
        to: 'info@safesapcrtx.org',
        subject: `New Member Signup: ${first_name} ${last_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2d3e50, #3d5066); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px;">New SAFE SAPCR Member!</h1>
            </div>
            <div style="padding: 25px; background: #ffffff;">
              <h2 style="color: #2d3e50; margin-top: 0;">Member Details</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; width: 140px;">Name:</td>
                  <td style="padding: 10px 0;">${first_name} ${last_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 10px 0;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                ${phone ? `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">Phone:</td>
                  <td style="padding: 10px 0;">${phone}</td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">City:</td>
                  <td style="padding: 10px 0;">${city}</td>
                </tr>
                ${county ? `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">County:</td>
                  <td style="padding: 10px 0;">${county}</td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">Involvement:</td>
                  <td style="padding: 10px 0;">${involvement || 'Not specified'}</td>
                </tr>
                ${experience ? `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">Experience:</td>
                  <td style="padding: 10px 0;">${experience}</td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">Legislative Updates:</td>
                  <td style="padding: 10px 0;">${legislative_updates ? '✓ Yes' : '✗ No'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold;">Newsletter:</td>
                  <td style="padding: 10px 0;">${newsletter ? '✓ Yes' : '✗ No'}</td>
                </tr>
              </table>

              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                <strong>Signed up:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (CST)
              </p>
            </div>
            <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0;">This notification was sent from the SAFE SAPCR membership form</p>
            </div>
          </div>
        `
      })
    });

    // Send welcome email to new member
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
        to: email,
        subject: 'Welcome to SAFE SAPCR Texas!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2d3e50, #3d5066); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Welcome to SAFE SAPCR Texas!</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Service Accountability and Fraud Elimination</p>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #2d3e50; margin-top: 0;">Thank You, ${first_name}!</h2>
              <p>You've joined a growing movement to reform Texas family law and protect parents from fraudulent service and abuse of process in family courts.</p>

              <h3 style="color: #2d3e50;">What's Next?</h3>
              <ul style="line-height: 1.8;">
                <li><strong>Contact Your Legislators</strong> - Use our directory to reach out to your state representatives</li>
                <li><strong>Stay Informed</strong> - We'll keep you updated on legislative developments</li>
                <li><strong>Share Our Mission</strong> - Help spread awareness about SAPCR reform</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://safesapcrtx.org/legislators" style="display: inline-block; background: #e08a3c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Your Legislator Now</a>
              </div>

              <p style="color: #666; font-size: 14px;">Questions? Reply to this email or contact us at info@safesapcrtx.org</p>
            </div>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0;">You're receiving this because you joined at safesapcrtx.org</p>
              <p style="margin: 5px 0 0;"><a href="https://safesapcrtx.org" style="color: #2d3e50;">safesapcrtx.org</a></p>
            </div>
          </div>
        `
      })
    });

    if (!adminResponse.ok) {
      const error = await adminResponse.json();
      console.error('Failed to send admin notification:', error);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Notifications sent' })
    };

  } catch (error) {
    console.error('Membership notify error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
