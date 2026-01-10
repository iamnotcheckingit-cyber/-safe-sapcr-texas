// Anonymous webhook proxy API
// Calls back to referer URL, logs publicly

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uynnupaoafbwouvgcedj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const timestamp = new Date().toISOString();
  const userAgent = event.headers['user-agent'] || 'unknown';
  const referer = event.headers['referer'] || event.headers['origin'] || null;

  try {
    // Parse request body
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        body = { raw: event.body.substring(0, 500) };
      }
    }

    let result = { status: 'logged', timestamp };

    // If referer exists, call back to it
    if (referer) {
      result = await callbackToReferer(referer, {
        timestamp,
        message: 'Callback from SAFESAPCR',
        received: body
      });
    }

    // Log everything publicly
    await supabase.from('webhook_log').insert({
      timestamp,
      method: event.httpMethod,
      path: event.path,
      user_agent: userAgent.substring(0, 200),
      payload: JSON.stringify({
        referer: referer ? maskUrl(referer) : 'none',
        body: body,
        callback: result.status
      }).substring(0, 1000)
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...result,
        referer: referer ? maskUrl(referer) : null,
        public_log: '/webhook-log'
      })
    };

  } catch (err) {
    console.error('Webhook error:', err);

    await supabase.from('webhook_log').insert({
      timestamp,
      method: event.httpMethod,
      path: event.path,
      user_agent: userAgent.substring(0, 200),
      payload: JSON.stringify({ error: err.message })
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'error', message: err.message })
    };
  }
};

// Callback to referer URL via proxy
async function callbackToReferer(refererUrl, payload) {
  try {
    const url = new URL(refererUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { status: 'skipped', message: 'Invalid protocol' };
    }

    // Build callback URL - use same origin with /webhook or /callback path
    const callbackUrl = `${url.protocol}//${url.host}/webhook`;

    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SAFESAPCR-Callback/1.0',
        'X-Callback-From': 'safesapcrtx.org'
      },
      body: JSON.stringify(payload)
    });

    return {
      status: 'callback_sent',
      statusCode: response.status,
      target: maskUrl(callbackUrl)
    };

  } catch (err) {
    return {
      status: 'callback_failed',
      message: err.message
    };
  }
}

// Mask URL for public logs
function maskUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}/***`;
  } catch {
    return '***';
  }
}
