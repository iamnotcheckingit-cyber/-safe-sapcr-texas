// Netlify Function to handle newsletter signups
// With security enhancements

// Security headers
const securityHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Access-Control-Allow-Origin': 'https://safesapcrtx.org',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Validate email format strictly
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Strict email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length >= 5 && email.length <= 254;
}

// Sanitize email input
function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase().slice(0, 254);
}

exports.handler = async (event, context) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: securityHeaders, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: securityHeaders, body: JSON.stringify({ success: false, error: 'Method Not Allowed' }) };
  }

  // Check origin
  const origin = event.headers.origin || event.headers.Origin || '';
  if (origin && !origin.includes('safesapcrtx.org') && !origin.includes('netlify.app')) {
    return { statusCode: 403, headers: securityHeaders, body: JSON.stringify({ success: false, error: 'Forbidden' }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return {
      statusCode: 500,
      headers: securityHeaders,
      body: JSON.stringify({ success: false, error: 'Email service not configured' })
    };
  }

  try {
    // Parse body safely
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ success: false, error: 'Invalid request' }) };
    }

    const email = sanitizeEmail(body.email);

    // Strict email validation
    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        headers: securityHeaders,
        body: JSON.stringify({ success: false, error: 'Valid email required' })
      };
    }

    console.log(JSON.stringify({ form_type: 'NEWSLETTER_SIGNUP', email_domain: email.split('@')[1], timestamp: new Date().toISOString() }));

    // Block disposable email domains (common spam sources)
    const disposableDomains = ['tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com', '10minutemail.com', 'temp-mail.org'];
    const emailDomain = email.split('@')[1];
    if (disposableDomains.some(d => emailDomain.includes(d))) {
      return {
        statusCode: 400,
        headers: securityHeaders,
        body: JSON.stringify({ success: false, error: 'Please use a permanent email address' })
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

    // Also notify the admin of new signup (sanitized)
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
            <p><strong>Email:</strong> ${email.replace(/[<>"'&]/g, '')}</p>
            <p><strong>Date:</strong> ${new Date().toISOString()}</p>
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
        headers: securityHeaders,
        body: JSON.stringify({ success: false, error: 'Failed to send welcome email' })
      };
    }

    return {
      statusCode: 200,
      headers: securityHeaders,
      body: JSON.stringify({ success: true, message: 'Subscribed successfully' })
    };

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return {
      statusCode: 500,
      headers: securityHeaders,
      body: JSON.stringify({ success: false, error: 'An error occurred' })
    };
  }
};
