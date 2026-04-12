export default async (request, context) => {
  const attackerIP = context.ip;
  const url = new URL(request.url);

  console.log(`Honeypot triggered: ${url.pathname} from ${attackerIP}`);

  // Redirect scanner back to their own IP
  return Response.redirect(`http://${attackerIP}${url.pathname}`, 301);
};

export const config = {
  path: [
    // E-commerce probes
    "/shop",
    "/account",
    "/order",
    "/payment",
    "/dashboard",
    "/plans",
    "/billing",
    "/cart",
    "/register",
    "/checkout",
    "/subscribe",
    "/signup",
    "/donate",
    "/pricing",

    // Environment file probes — removed from honeypot.
    // These are handled by netlify.toml with status 404 (not 301).
    // The edge function was intercepting first and returning 301,
    // which is wrong for .env files — they should hard-404.

    // Git/config probes
    "/.git/config",
    "/.vscode/sftp.json",

    // WordPress probes
    "/wp-login.php",
    "/wp-config.old",
    "/wp-config.php.save",
    "/wp-config.php~",
    "/wp-json/wc/v2/payment_gateways",

    // Credential/secret probes
    "/aws-secret.yaml",
    "/credentials.json",
    "/stripe.key",
    "/storage/stripe.json",
    "/storage/app/stripe.json",

    // Other scanner targets
    "/etl-showcase",
    "/cmd.php",
    "/shell.php",
    "/shll.php",
    "/phpinfo.php",
    "/info.php",
    "/test.php",
    "/eval/",
    "/cgi-bin/",
    "/phpmyadmin/",
    "/administrator/",
    "/xmlrpc.php"
  ]
};
