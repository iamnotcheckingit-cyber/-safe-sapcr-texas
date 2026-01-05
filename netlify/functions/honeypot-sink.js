/**
 * Honeypot Sink - Collects and logs honeypot interactions
 * Logs to Supabase for persistence and analysis
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uynnupaoafbwouvgcedj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // Parse incoming data
        let data = {};
        if (event.body) {
            try {
                data = JSON.parse(event.body);
            } catch {
                // URL-encoded form data
                const params = new URLSearchParams(event.body);
                data = Object.fromEntries(params);
            }
        }

        // Extract metadata
        const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                        event.headers['x-nf-client-connection-ip'] ||
                        event.headers['client-ip'] ||
                        'unknown';

        const metadata = {
            timestamp: new Date().toISOString(),
            ip: clientIP,
            method: event.httpMethod,
            path: event.path,
            user_agent: event.headers['user-agent'] || 'unknown',
            referer: event.headers['referer'] || 'direct',
            accept_language: event.headers['accept-language'] || 'unknown',
            country: event.headers['x-country'] || event.headers['cf-ipcountry'] || 'unknown',
            request_id: context.awsRequestId || Date.now().toString()
        };

        // Analyze for bot indicators
        const botSignals = [];

        // Timing analysis (< 2s = likely automated)
        if (data.hp_delta_ms && data.hp_delta_ms < 2000) {
            botSignals.push('fast_submit_' + data.hp_delta_ms + 'ms');
        }
        if (data.hp_delta && data.hp_delta < 2000) {
            botSignals.push('fast_submit_' + data.hp_delta + 'ms');
        }
        if (data.hp_duration && data.hp_duration < 2000) {
            botSignals.push('fast_submit_' + data.hp_duration + 'ms');
        }

        // Honeypot field fills (bots fill hidden fields)
        const hpFields = ['email', 'website', 'fax', 'company', 'address2', 'api_key', 'token', 'auth'];
        for (const field of hpFields) {
            if (data[field] && data[field].length > 0) {
                botSignals.push('filled_trap_' + field);
            }
        }

        // Missing expected browser signals
        if (!data.hp_ua && !data.hp_user_agent) {
            botSignals.push('no_ua_reported');
        }

        // Suspicious user agents
        const ua = (data.hp_ua || data.hp_user_agent || metadata.user_agent || '').toLowerCase();
        const suspiciousUA = ['curl', 'wget', 'python', 'go-http', 'java', 'bot', 'spider', 'crawler', 'scan', 'http'];
        for (const sus of suspiciousUA) {
            if (ua.includes(sus)) {
                botSignals.push('sus_ua_' + sus);
            }
        }

        // Classification
        let classification = 'unknown';
        if (botSignals.length >= 3) {
            classification = 'definite_bot';
        } else if (botSignals.length >= 1) {
            classification = 'probable_bot';
        } else {
            classification = 'possible_human_or_operator';
        }

        // Build log entry
        const logEntry = {
            ...metadata,
            source_page: data.hp_page || data.hp_source || 'api',
            classification,
            bot_signals: botSignals.join(', ') || 'none',
            credentials_attempted: !!(data.username || data.user || data.access_key),
            form_data_keys: Object.keys(data).filter(k => !k.startsWith('hp_')).join(', '),
            raw_payload: JSON.stringify(data).substring(0, 500) // Truncate for storage
        };

        // Log to console (appears in Netlify function logs)
        console.log('HONEYPOT_HIT:', JSON.stringify(logEntry, null, 2));

        // Log to Supabase for persistence and analysis
        await supabase.from('honeypot_log').insert({
            timestamp: logEntry.timestamp,
            ip: logEntry.ip,
            method: logEntry.method,
            path: logEntry.path,
            user_agent: logEntry.user_agent,
            referer: logEntry.referer,
            country: logEntry.country,
            source_page: logEntry.source_page,
            classification: logEntry.classification,
            bot_signals: logEntry.bot_signals,
            credentials_attempted: logEntry.credentials_attempted,
            form_data_keys: logEntry.form_data_keys,
            raw_payload: logEntry.raw_payload
        }).catch(err => console.error('Supabase log error:', err));

        // Always return success to keep bots engaged
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                error: 'unauthorized',
                message: 'Invalid credentials',
                trace: metadata.request_id
            })
        };

    } catch (error) {
        console.error('Honeypot sink error:', error);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ error: 'internal_error' })
        };
    }
};
