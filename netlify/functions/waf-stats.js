// WAF Statistics API
// Returns aggregated WAF and traffic data for monitoring

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

const headers = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store'
};

export async function handler(event, context) {
  // Simple auth check - require a secret key
  const authKey = event.headers['x-auth-key'] || event.queryStringParameters?.key;
  const expectedKey = process.env.WAF_STATS_KEY || 'safesapcr-waf-2025';

  if (authKey !== expectedKey) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    // Get time range from query params (default: last 24 hours)
    const hours = parseInt(event.queryStringParameters?.hours || '24');
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // WAF actions summary
    const wafActions = await sql`
      SELECT
        waf_action,
        COUNT(*) as count
      FROM waf_logs
      WHERE timestamp > ${since}
      GROUP BY waf_action
      ORDER BY count DESC
    `;

    // Top blocked IPs
    const blockedIps = await sql`
      SELECT
        client_ip,
        country,
        COUNT(*) as block_count
      FROM waf_logs
      WHERE timestamp > ${since}
        AND waf_action IN ('block', 'challenge')
      GROUP BY client_ip, country
      ORDER BY block_count DESC
      LIMIT 20
    `;

    // Top targeted paths
    const targetedPaths = await sql`
      SELECT
        path,
        COUNT(*) as hit_count,
        COUNT(CASE WHEN waf_action = 'block' THEN 1 END) as blocked
      FROM waf_logs
      WHERE timestamp > ${since}
      GROUP BY path
      ORDER BY hit_count DESC
      LIMIT 20
    `;

    // Traffic by country
    const trafficByCountry = await sql`
      SELECT
        country,
        COUNT(*) as requests,
        COUNT(CASE WHEN waf_action = 'block' THEN 1 END) as blocked
      FROM traffic_logs
      WHERE timestamp > ${since}
      GROUP BY country
      ORDER BY requests DESC
      LIMIT 20
    `;

    // Hourly traffic trend
    const hourlyTrend = await sql`
      SELECT
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(*) as requests,
        COUNT(CASE WHEN waf_action = 'block' THEN 1 END) as blocked
      FROM traffic_logs
      WHERE timestamp > ${since}
      GROUP BY DATE_TRUNC('hour', timestamp)
      ORDER BY hour DESC
      LIMIT 24
    `;

    // Recent WAF blocks
    const recentBlocks = await sql`
      SELECT
        timestamp,
        client_ip,
        country,
        path,
        waf_rule_message,
        user_agent
      FROM waf_logs
      WHERE waf_action IN ('block', 'challenge')
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    // Total counts
    const totals = await sql`
      SELECT
        (SELECT COUNT(*) FROM traffic_logs WHERE timestamp > ${since}) as total_requests,
        (SELECT COUNT(*) FROM waf_logs WHERE timestamp > ${since}) as waf_events,
        (SELECT COUNT(*) FROM waf_logs WHERE timestamp > ${since} AND waf_action = 'block') as blocked,
        (SELECT COUNT(DISTINCT client_ip) FROM waf_logs WHERE timestamp > ${since} AND waf_action = 'block') as unique_blocked_ips
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        timeRange: {
          hours,
          since
        },
        totals: totals[0] || {},
        wafActions,
        blockedIps,
        targetedPaths,
        trafficByCountry,
        hourlyTrend,
        recentBlocks: recentBlocks.slice(0, 20) // Limit response size
      }, null, 2)
    };

  } catch (error) {
    console.error('WAF stats error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch stats', message: error.message })
    };
  }
}
