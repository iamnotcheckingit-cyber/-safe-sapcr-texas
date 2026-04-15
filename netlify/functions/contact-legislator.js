// Netlify Function to send emails to legislators via Resend
const { createClient } = require('@supabase/supabase-js');
const LEGISLATORS = require('./legislators.json');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uynnupaoafbwouvgcedj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const getDaysSeparated = () => Math.floor((new Date() - new Date('2023-12-27')) / 86400000);

const SCHEDULED_SUBJECT = () =>
  `Texas SAPCR Fraud: Father Separated ${getDaysSeparated()}+ Days — Please Support the SAFE SAPCR Act`;

const SCHEDULED_HTML = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #222; line-height: 1.55;">
    <p>Dear ${name},</p>
    <p>I'm writing as a Texas constituent and a father who lost custody through a default SAPCR judgment based on a knowingly false Certificate of Last Known Address. I've now been separated from my daughter for over ${getDaysSeparated()} days.</p>
    <p>This isn't an isolated incident. Texas family courts routinely enter default custody judgments without any address verification, creating an open lane for service-of-process fraud.</p>
    <p>The <strong>SAFE SAPCR Act</strong> would close that gap by requiring courts to verify addresses before entering default judgments in custody cases. Full documentation, proposed legislative text, and supporting case records are at <a href="https://safesapcrtx.org">safesapcrtx.org</a>.</p>
    <p>I would be grateful for a few minutes of your time to discuss sponsorship or co-sponsorship.</p>
    <p>Respectfully,<br>
    Scott Willis<br>
    Founder, SAFE SAPCR Texas<br>
    <a href="mailto:iamnotcheckingit@gmail.com">iamnotcheckingit@gmail.com</a></p>
  </div>
`;

async function sendScheduledBatch(RESEND_API_KEY, batchSize = 5, cooldownDays = 30) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Pull recent contact log to enforce a cooldown per legislator
  const cutoff = new Date(Date.now() - cooldownDays * 86400000).toISOString();
  const { data: recent } = await supabase
    .from('outreach_log')
    .select('email, sent_at')
    .gte('sent_at', cutoff);

  const recentEmails = new Set((recent || []).map(r => r.email));
  const queue = LEGISLATORS
    .filter(l => !recentEmails.has(l.email))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, batchSize);

  if (queue.length === 0) {
    return { sent: 0, skipped: LEGISLATORS.length, message: 'All legislators within cooldown window' };
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < queue.length; i++) {
    const lg = queue[i];
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Scott Willis - SAFE SAPCR Texas <iamnotcheckingit@gmail.com>',
          to: lg.email,
          reply_to: 'iamnotcheckingit@gmail.com',
          subject: SCHEDULED_SUBJECT(),
          html: SCHEDULED_HTML(lg.name)
        })
      });

      const payload = await resp.json();
      if (!resp.ok) throw new Error(payload?.message || `status ${resp.status}`);

      results.push({ email: lg.email, id: payload?.id });

      await supabase.from('outreach_log').insert({
        outlet: `${lg.name} (${lg.chamber})`,
        email: lg.email,
        sent_at: new Date().toISOString(),
        status: 'sent',
        resend_id: payload?.id
      }).catch(() => {});

      if (i < queue.length - 1) await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      errors.push({ email: lg.email, error: err.message });
    }
  }

  return { sent: results.length, failed: errors.length, results, errors };
}

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
    const body = JSON.parse(event.body);
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    console.log(JSON.stringify({ form_type: 'LEGISLATOR_CONTACT', ip: clientIP, legislator: body.legislatorName, scheduled: !!body.scheduled, timestamp: new Date().toISOString() }));

    // Scheduled cron trigger: batch-send to pending legislators
    if (body.scheduled) {
      const result = await sendScheduledBatch(RESEND_API_KEY, body.batchSize, body.cooldownDays);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, ...result }) };
    }

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
    } = body;

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
        from: 'SAFE SAPCR Texas <iamnotcheckingit@gmail.com>',
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
          from: 'SAFE SAPCR Texas <iamnotcheckingit@gmail.com>',
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
        from: 'SAFE SAPCR Texas <iamnotcheckingit@gmail.com>',
        to: 'iamnotcheckingit@gmail.com',
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
