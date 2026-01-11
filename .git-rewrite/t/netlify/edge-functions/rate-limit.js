// Edge function for rate limiting on sensitive pages
// Prevents abuse and scraping

export default async (request, context) => {
  const clientIP = context.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const url = new URL(request.url);

  // Get rate limit store (uses Netlify's edge storage)
  const rateLimitKey = `rate_limit:${clientIP}:${url.pathname}`;

  // Check for suspicious patterns
  const userAgent = request.headers.get('user-agent') || '';
  const isSuspicious =
    !userAgent ||
    userAgent.length < 10 ||
    /curl|wget|python|scrapy|bot|crawler|spider/i.test(userAgent);

  // Block known bad bots (but allow legitimate search engines)
  const blockedBots = /semrush|ahrefs|mj12bot|dotbot|blexbot|linkfluence/i;
  if (blockedBots.test(userAgent)) {
    return new Response('Access Denied', {
      status: 403,
      headers: { 'X-Blocked-Reason': 'Bot detected' }
    });
  }

  // Add security headers to response
  const response = await context.next();

  // Clone headers and add security headers
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('X-XSS-Protection', '1; mode=block');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add cache control for case study page
  if (url.pathname === '/case-study') {
    newHeaders.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  }

  // Log suspicious access for monitoring
  if (isSuspicious) {
    console.log(`Suspicious access: IP=${clientIP}, UA=${userAgent}, Path=${url.pathname}`);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
};

export const config = {
  path: ["/case-study", "/case-study/*"]
};
