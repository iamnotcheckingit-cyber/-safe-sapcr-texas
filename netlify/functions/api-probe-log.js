// Catch-all for API probes - logs all attempts to non-existent endpoints
exports.handler = async (event) => {
  const timestamp = new Date().toISOString();
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  const userAgent = event.headers['user-agent'] || 'unknown';
  const path = event.path;
  const method = event.httpMethod;
  const referer = event.headers['referer'] || 'direct';
  const country = event.headers['x-country'] || event.headers['cf-ipcountry'] || 'unknown';

  // Log the probe attempt
  console.log(JSON.stringify({
    type: 'API_PROBE',
    timestamp,
    ip,
    userAgent,
    path,
    method,
    referer,
    country,
    headers: event.headers
  }));

  const validEndpoints = [
    '/api/case',
    '/api/timeline',
    '/api/perjury',
    '/api/evidence'
  ];

  const response = {
    error: 'Endpoint not found',
    probeLogged: true,
    timestamp,
    yourIP: ip,
    yourCountry: country,
    attemptedPath: path,
    validEndpoints,
    message: 'This probe attempt has been logged. All API activity is monitored.',
    notice: 'LITIGATION HOLD IN EFFECT - All logs preserved for legal proceedings'
  };

  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Probe-Logged': 'true',
      'X-Litigation-Hold': 'active'
    },
    body: JSON.stringify(response, null, 2)
  };
};
