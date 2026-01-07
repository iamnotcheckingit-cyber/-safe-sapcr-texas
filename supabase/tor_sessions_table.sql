-- TOR Session Logging Table
-- Run this in Supabase SQL Editor to create the table

-- Drop existing table if needed (be careful in production)
-- DROP TABLE IF EXISTS tor_sessions;

CREATE TABLE IF NOT EXISTS tor_sessions (
    id BIGSERIAL PRIMARY KEY,

    -- Connection info
    ip TEXT NOT NULL,
    is_tor BOOLEAN DEFAULT false,
    user_agent TEXT,

    -- Fingerprinting
    fingerprint TEXT,
    canvas_hash TEXT,
    audio_hash TEXT,

    -- Session data
    page_visited TEXT,
    referrer TEXT,
    scroll_depth INTEGER,
    time_on_page INTEGER, -- milliseconds
    form_interaction BOOLEAN DEFAULT false,
    honeypot_triggered BOOLEAN DEFAULT false,

    -- Device info
    screen_resolution TEXT,
    timezone TEXT,

    -- Raw headers for forensics
    headers JSONB,

    -- Timestamps
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tor_sessions_ip ON tor_sessions(ip);
CREATE INDEX IF NOT EXISTS idx_tor_sessions_is_tor ON tor_sessions(is_tor);
CREATE INDEX IF NOT EXISTS idx_tor_sessions_fingerprint ON tor_sessions(fingerprint);
CREATE INDEX IF NOT EXISTS idx_tor_sessions_timestamp ON tor_sessions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tor_sessions_honeypot ON tor_sessions(honeypot_triggered);

-- Create a view for TOR-only sessions
CREATE OR REPLACE VIEW tor_only_sessions AS
SELECT * FROM tor_sessions WHERE is_tor = true ORDER BY timestamp DESC;

-- Create a view for daily TOR activity summary
CREATE OR REPLACE VIEW tor_daily_summary AS
SELECT
    DATE(timestamp) as date,
    COUNT(*) as total_visits,
    COUNT(DISTINCT ip) as unique_ips,
    COUNT(DISTINCT fingerprint) as unique_fingerprints,
    SUM(CASE WHEN honeypot_triggered THEN 1 ELSE 0 END) as honeypot_triggers,
    AVG(time_on_page) as avg_time_on_page
FROM tor_sessions
WHERE is_tor = true
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Create a view to detect same fingerprint across different TOR exits
CREATE OR REPLACE VIEW suspicious_fingerprints AS
SELECT
    fingerprint,
    COUNT(DISTINCT ip) as different_ips,
    ARRAY_AGG(DISTINCT ip) as ip_list,
    MIN(timestamp) as first_seen,
    MAX(timestamp) as last_seen,
    COUNT(*) as total_visits
FROM tor_sessions
WHERE is_tor = true AND fingerprint IS NOT NULL
GROUP BY fingerprint
HAVING COUNT(DISTINCT ip) > 1
ORDER BY different_ips DESC;

-- Enable RLS (Row Level Security)
ALTER TABLE tor_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from anonymous users (for tracking)
CREATE POLICY "Allow anonymous insert" ON tor_sessions
    FOR INSERT
    WITH CHECK (true);

-- Policy: Only allow select for authenticated users
CREATE POLICY "Allow authenticated select" ON tor_sessions
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Function to get TOR activity report
CREATE OR REPLACE FUNCTION get_tor_report(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
    report_date DATE,
    tor_visits BIGINT,
    unique_tor_ips BIGINT,
    honeypots_triggered BIGINT,
    suspicious_actors BIGINT
)
LANGUAGE SQL
AS $$
    SELECT
        DATE(timestamp) as report_date,
        COUNT(*) FILTER (WHERE is_tor) as tor_visits,
        COUNT(DISTINCT ip) FILTER (WHERE is_tor) as unique_tor_ips,
        COUNT(*) FILTER (WHERE honeypot_triggered) as honeypots_triggered,
        COUNT(DISTINCT fingerprint) FILTER (WHERE is_tor AND honeypot_triggered) as suspicious_actors
    FROM tor_sessions
    WHERE timestamp >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY DATE(timestamp)
    ORDER BY report_date DESC;
$$;

-- Grant permissions
GRANT SELECT, INSERT ON tor_sessions TO anon;
GRANT SELECT, INSERT ON tor_sessions TO authenticated;
GRANT ALL ON tor_sessions TO service_role;

COMMENT ON TABLE tor_sessions IS 'Tracks TOR visitor sessions and suspicious activity for security monitoring';
