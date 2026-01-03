// Netlify Log Drain Receiver
// Stores WAF and traffic logs in Neon database
// Configure as HTTP Log Drain endpoint: https://safesapcrtx.org/.netlify/functions/log-drain

import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.NETLIFY_DATABASE_URL);

// Security headers
const headers = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff'
};

// Initialize tables if they don't exist
async function initTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS waf_logs (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      request_id TEXT,
      client_ip TEXT,
      country TEXT,
      path TEXT,
      method TEXT,
      user_agent TEXT,
      waf_action TEXT,
      waf_rule_id TEXT,
      waf_rule_message TEXT,
      raw_log JSONB
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS traffic_logs (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      request_id TEXT,
      client_ip TEXT,
      country TEXT,
      path TEXT,
      method TEXT,
      status_code INTEGER,
      response_time_ms INTEGER,
      waf_action TEXT,
      raw_log JSONB
    )
  `;

  // Create indexes for common queries
  await sql`CREATE INDEX IF NOT EXISTS idx_waf_logs_timestamp ON waf_logs(timestamp)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_waf_logs_client_ip ON waf_logs(client_ip)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_waf_logs_action ON waf_logs(waf_action)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_traffic_logs_timestamp ON traffic_logs(timestamp)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_traffic_logs_client_ip ON traffic_logs(client_ip)`;
}

// Parse and store WAF log entry
async function storeWafLog(log) {
  try {
    await sql`
      INSERT INTO waf_logs (
        request_id, client_ip, country, path, method,
        user_agent, waf_action, waf_rule_id, waf_rule_message, raw_log
      ) VALUES (
        ${log.request_id || null},
        ${log.client_ip || log.ip || null},
        ${log.geo?.country || log.country || null},
        ${log.path || log.url || null},
        ${log.method || null},
        ${log.user_agent || null},
        ${log.action || log.waf?.action || null},
        ${log.rule_id || log.waf?.rule_id || null},
        ${log.message || log.waf?.message || null},
        ${JSON.stringify(log)}
      )
    `;
  } catch (error) {
    console.error('Error storing WAF log:', error);
  }
}

// Parse and store traffic log entry
async function storeTrafficLog(log) {
  try {
    await sql`
      INSERT INTO traffic_logs (
        request_id, client_ip, country, path, method,
        status_code, response_time_ms, waf_action, raw_log
      ) VALUES (
        ${log.request_id || null},
        ${log.client_ip || log.ip || null},
        ${log.geo?.country || log.country || null},
        ${log.path || log.url || null},
        ${log.method || null},
        ${log.status_code || log.status || null},
        ${log.response_time || log.duration || null},
        ${log.waf?.action || null},
        ${JSON.stringify(log)}
      )
    `;
  } catch (error) {
    console.error('Error storing traffic log:', error);
  }
}

export async function handler(event, context) {
  // Only accept POST from Netlify
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Verify request is from Netlify (check for Netlify signature header)
  const netlifySignature = event.headers['x-netlify-signature'] || event.headers['X-Netlify-Signature'];
  // In production, you should verify this signature
  // For now, we'll accept requests with user-agent containing 'Netlify'
  const userAgent = event.headers['user-agent'] || '';

  if (!netlifySignature && !userAgent.includes('Netlify')) {
    console.log('Unauthorized log drain request:', { userAgent });
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    // Initialize tables on first request
    await initTables();

    // Parse the log payload
    // Netlify sends logs as newline-delimited JSON
    const body = event.body;
    const logs = body.split('\n').filter(line => line.trim()).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    console.log(`Received ${logs.length} log entries`);

    // Process each log entry
    for (const log of logs) {
      // Determine log type and store accordingly
      if (log.type === 'waf' || log.waf?.rule_id) {
        await storeWafLog(log);
      } else {
        await storeTrafficLog(log);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        processed: logs.length
      })
    };

  } catch (error) {
    console.error('Log drain error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal error' })
    };
  }
}
