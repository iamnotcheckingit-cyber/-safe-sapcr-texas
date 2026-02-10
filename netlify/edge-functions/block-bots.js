const BLOCKED_IPS = [
  "103.86.44.71",
  "27.102.129.111"
];

const BLOCKED_PATTERNS = [
  /wp-login\.php/i,
  /xmlrpc\.php/i,
  /wp-admin/i,
  /wp-content/i,
  /wordpress/i,
  /\.env$/i,
  /config\.php/i,
  /setup-config\.php/i,
];

const BLOCKED_USER_AGENTS = [
  /masscan/i,
  /nikto/i,
  /sqlmap/i,
  /nmap/i,
  /scanner/i,
  /bot.*wordpress/i,
];

export default async (request, context) => {
  const clientIP = context.ip;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Block specific IPs
  if (BLOCKED_IPS.includes(clientIP)) {
    console.log(`Blocked IP: ${clientIP}`);
    return new Response("Access Denied", { status: 403 });
  }

  // Block WordPress scanner patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(url.pathname)) {
      console.log(`Blocked pattern: ${url.pathname} from ${clientIP}`);
      return new Response("Not Found", { status: 404 });
    }
  }

  // Block malicious user agents
  for (const pattern of BLOCKED_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      console.log(`Blocked user agent: ${userAgent} from ${clientIP}`);
      return new Response("Access Denied", { status: 403 });
    }
  }

  return context.next();
};

export const config = { path: "/*" };