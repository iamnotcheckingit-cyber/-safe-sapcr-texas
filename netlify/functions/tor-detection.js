// TOR Exit Node Detection & Logging
// Fetches live TOR exit list, caches it, and logs TOR visitor activity

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uynnupaoafbwouvgcedj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

// Cache TOR exit nodes in memory (refreshed hourly by edge function)
let torExitCache = {
    nodes: new Set(),
    lastFetch: 0,
    ttl: 3600000 // 1 hour
};

async function fetchTorExitNodes() {
    const now = Date.now();

    // Return cached if fresh
    if (torExitCache.nodes.size > 0 && (now - torExitCache.lastFetch) < torExitCache.ttl) {
        return torExitCache.nodes;
    }

    try {
        // Fetch from TOR Project's official list
        const response = await fetch('https://check.torproject.org/torbulkexitlist');
        if (!response.ok) throw new Error('Failed to fetch TOR list');

        const text = await response.text();
        const nodes = new Set(
            text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
        );

        torExitCache.nodes = nodes;
        torExitCache.lastFetch = now;

        console.log(`TOR exit list refreshed: ${nodes.size} nodes`);
        return nodes;
    } catch (err) {
        console.error('TOR list fetch error:', err);
        return torExitCache.nodes; // Return stale cache on error
    }
}

function isTorExitNode(ip, nodes) {
    return nodes.has(ip);
}

// Generate unique session fingerprint
function generateSessionFingerprint(ip, ua, timestamp) {
    const data = `${ip}-${ua}-${timestamp}-${Math.random().toString(36)}`;
    // Simple hash for fingerprint
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36).padStart(12, '0');
}

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || event.headers['x-real-ip']
        || event.headers['client-ip']
        || 'unknown';

    // GET - Check if IP is TOR
    if (event.httpMethod === 'GET') {
        const checkIP = event.queryStringParameters?.ip || clientIP;
        const nodes = await fetchTorExitNodes();
        const isTor = isTorExitNode(checkIP, nodes);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ip: checkIP,
                isTor,
                nodeCount: nodes.size,
                cacheAge: Math.floor((Date.now() - torExitCache.lastFetch) / 1000)
            })
        };
    }

    // POST - Log TOR visitor activity
    if (event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body);
            const {
                page,
                referrer,
                scrollDepth,
                timeOnPage,
                formInteraction,
                honeypotTriggered,
                canvasFingerprint,
                audioFingerprint,
                screenRes,
                timezone,
                sessionId
            } = body;

            const userAgent = event.headers['user-agent'] || 'unknown';
            const nodes = await fetchTorExitNodes();
            const isTor = isTorExitNode(clientIP, nodes);

            // Generate or use existing session fingerprint
            const fingerprint = sessionId || generateSessionFingerprint(clientIP, userAgent, Date.now());

            // Log to Supabase if configured
            if (SUPABASE_KEY) {
                const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

                await supabase.from('tor_sessions').insert([{
                    ip: clientIP,
                    is_tor: isTor,
                    user_agent: userAgent,
                    fingerprint: fingerprint,
                    canvas_hash: canvasFingerprint,
                    audio_hash: audioFingerprint,
                    page_visited: page,
                    referrer: referrer,
                    scroll_depth: scrollDepth,
                    time_on_page: timeOnPage,
                    form_interaction: formInteraction,
                    honeypot_triggered: honeypotTriggered,
                    screen_resolution: screenRes,
                    timezone: timezone,
                    headers: JSON.stringify(event.headers),
                    timestamp: new Date().toISOString()
                }]);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    logged: true,
                    fingerprint,
                    isTor
                })
            };
        } catch (err) {
            console.error('TOR logging error:', err);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: err.message })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
