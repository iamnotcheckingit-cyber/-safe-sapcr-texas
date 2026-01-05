const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uynnupaoafbwouvgcedj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

// Calculate days separated (from Dec 27, 2023)
const getDaysSeparated = () => Math.floor((new Date() - new Date('2023-12-27')) / 86400000);

// Default email template for media outreach
const getDefaultSubject = () => `Texas Father Separated ${getDaysSeparated()}+ Days from Daughter by Default SAPCR Judgment - Story Pitch`;
const DEFAULT_HTML_TEMPLATE = `
<p>Dear {{outlet}} News Desk,</p>

<p>I'm reaching out about a story that affects thousands of Texas families every year.</p>

<p>A Texas father was personally served in a SAPCR (custody) case, sent three emails requesting mediation, but 104 days later the opposing attorney filed a Certificate of Last Known Address listing an address the father hadn't lived at in over 10 years. A default judgment was entered without his knowledge, stripping all parental rights.</p>

<p><strong>Key facts:</strong></p>
<ul>
<li>Father was properly served at his actual address on April 6, 2024</li>
<li>Default judgment entered August 20, 2024 using false address</li>
<li>Now separated from his daughter for over {{days}} days</li>
<li>Exposed systemic issues in Texas family courts</li>
</ul>

<p>This case has led to proposed legislation: the <strong>SAFE SAPCR Act</strong>, which would require courts to verify addresses before entering default judgments in custody cases.</p>

<p>Full case documentation and proposed legislation available at: <a href="https://safesapcrtx.org">safesapcrtx.org</a></p>

<p>Would you be interested in covering this story?</p>

<p>Best regards,<br>
Scott Willis<br>
Founder, SAFE SAPCR Texas<br>
info@safesapcrtx.org</p>
`;

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Parse request body
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        body = {};
    }

    let { recipients, subject, htmlBody, bcc, scheduled, batchSize } = body;

    // If scheduled trigger or no recipients, pull from Supabase
    if (scheduled || !recipients || recipients.length === 0) {
        const { data: contacts, error } = await supabase
            .from('media_contacts')
            .select('email, outlet, category')
            .eq('status', 'pending')
            .order('priority', { ascending: false })
            .limit(batchSize || 25);

        if (error || !contacts || contacts.length === 0) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'No pending contacts to send',
                    error: error?.message
                })
            };
        }

        recipients = contacts.map(c => ({ email: c.email, outlet: c.outlet }));
        subject = subject || getDefaultSubject();
        htmlBody = htmlBody || DEFAULT_HTML_TEMPLATE.replace('{{days}}', getDaysSeparated());
    }

    if (!recipients || recipients.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No recipients available' }) };
    }

    const results = [];
    const errors = [];

    // Send emails one by one with delay to avoid rate limiting
    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        try {
            const emailPayload = {
                from: 'Scott Willis - SAFE SAPCR Texas <info@safesapcrtx.org>',
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

            // Log to outreach_log with real timestamp
            await supabase.from('outreach_log').insert({
                outlet: recipient.outlet || 'Unknown',
                email: recipient.email,
                sent_at: new Date().toISOString(),
                status: 'sent',
                resend_id: result.data?.id
            }).catch(() => {});

            // Mark contact as sent in media_contacts
            await supabase.from('media_contacts')
                .update({ status: 'sent', sent_at: new Date().toISOString() })
                .eq('email', recipient.email)
                .catch(() => {});

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
