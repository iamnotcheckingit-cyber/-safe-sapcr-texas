-- =============================================
-- SUPABASE RLS POLICIES - SAFESAPCR
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. SURVEILLANCE TABLES (service_role only - no public access)
-- =============================================

-- tor_sessions: Only service_role can read/write
ALTER TABLE IF EXISTS tor_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access" ON tor_sessions;
-- No policies means only service_role can access

-- honeypot_log: Only service_role can read/write  
ALTER TABLE IF EXISTS honeypot_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access" ON honeypot_log;
-- No policies means only service_role can access

-- 2. PUBLIC TABLES (INSERT allowed, SELECT restricted)
-- =============================================

-- members: Allow anonymous INSERT, restrict SELECT to service_role
ALTER TABLE IF EXISTS members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON members;
DROP POLICY IF EXISTS "Service role full access" ON members;

CREATE POLICY "Allow anonymous insert" ON members
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON members
  FOR ALL
  USING (auth.role() = 'service_role');

-- petition_signatures: Allow anonymous INSERT, restrict SELECT to service_role
ALTER TABLE IF EXISTS petition_signatures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON petition_signatures;
DROP POLICY IF EXISTS "Service role full access" ON petition_signatures;

CREATE POLICY "Allow anonymous insert" ON petition_signatures
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON petition_signatures
  FOR ALL
  USING (auth.role() = 'service_role');

-- 3. OTHER TABLES (if they exist)
-- =============================================

-- media_outreach: service_role only
ALTER TABLE IF EXISTS media_outreach ENABLE ROW LEVEL SECURITY;

-- newsletter_subscribers: INSERT allowed, SELECT restricted
ALTER TABLE IF EXISTS newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON newsletter_subscribers;
CREATE POLICY "Allow anonymous insert" ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- =============================================
-- VERIFY: Run this to check RLS status
-- =============================================
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';
