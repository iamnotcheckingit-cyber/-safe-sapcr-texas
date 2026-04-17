const BLOCKED_IPS = new Set([
  "52.167.144.202",
  "52.167.144.198",
  "65.55.210.175",
  "172.215.218.102",
  "20.169.78.137",
  "192.178.15.68",
  "52.190.190.201",
]);

const BLOCKED_PREFIXES = [
  "43.133.",
  "43.135.",
  "43.157.",
  "43.167.",
  "49.234.",
];

export default async (request, context) => {
  const ip = context.ip;
  if (BLOCKED_IPS.has(ip)) return new Response("Forbidden", { status: 403 });
  if (BLOCKED_PREFIXES.some(prefix => ip.startsWith(prefix))) return new Response("Forbidden", { status: 403 });

  // WP user enumeration probe: /?author=1, /?author=2, etc.
  // Netlify [[redirects]] doesn't match query strings by default, so handle here.
  const url = new URL(request.url);
  if (url.searchParams.has("author")) {
    return new Response("Not Found", { status: 404 });
  }

  return context.next();
};

export const config = { path: "/*" };
