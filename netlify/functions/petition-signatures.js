// Petition signatures - store and retrieve from Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uynnupaoafbwouvgcedj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

function getRelativeTime(timestamp) {
    const now = new Date();
    const signed = new Date(timestamp);
    const diffMs = now - signed;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
}

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Check if Supabase is configured
    if (!SUPABASE_KEY) {
        console.warn('SUPABASE_KEY not configured, returning baseline data');
        if (event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    total: 1247,
                    signatures: [],
                    hasData: false
                })
            };
        }
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Database not configured' })
        };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // POST - Add new signature
    if (event.httpMethod === 'POST') {
        try {
            const { name, email, city, state, displayName, receiveUpdates } = JSON.parse(event.body);

            // Get first initial and last initial for display
            const nameParts = name.trim().split(' ');
            const displayInitial = nameParts[0].charAt(0).toUpperCase();
            const displayLast = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + '.' : '';
            const publicName = displayName ? `${nameParts[0]} ${displayLast}` : 'Anonymous';

            const { data, error } = await supabase
                .from('petition_signatures')
                .insert([{
                    name: name,
                    email: email,
                    city: city,
                    state: state,
                    display_name: publicName,
                    display_initial: displayInitial,
                    receive_updates: receiveUpdates,
                    signed_at: new Date().toISOString()
                }]);

            if (error) {
                console.error('Supabase insert error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ success: false, error: error.message })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } catch (err) {
            console.error('Petition signature error:', err);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ success: false, error: err.message })
            };
        }
    }

    // GET - Retrieve recent signatures and count
    if (event.httpMethod === 'GET') {
        try {
            // Get recent signatures
            const { data: recentSignatures, error } = await supabase
                .from('petition_signatures')
                .select('display_name, display_initial, city, state, signed_at')
                .order('signed_at', { ascending: false })
                .limit(4);

            if (error) {
                console.error('Supabase query error:', error);
                // Return baseline data on error
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        total: 1247,
                        signatures: [],
                        hasData: false,
                        error: 'Database temporarily unavailable'
                    })
                };
            }

            // Get total count
            const { count: totalCount, error: countError } = await supabase
                .from('petition_signatures')
                .select('*', { count: 'exact', head: true });

            // Baseline count before Supabase tracking
            const baselineCount = 1247;
            const total = (totalCount || 0) + baselineCount;

            // Format signatures with relative times
            const signatures = (recentSignatures || []).map(sig => ({
                name: sig.display_name,
                initial: sig.display_initial,
                location: `${sig.city}, ${sig.state}`,
                time: getRelativeTime(sig.signed_at)
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    total,
                    signatures,
                    hasData: recentSignatures && recentSignatures.length > 0
                })
            };
        } catch (err) {
            console.error('Petition GET error:', err);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    total: 1247,
                    signatures: [],
                    hasData: false,
                    error: err.message
                })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
