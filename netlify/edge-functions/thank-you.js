export default async (request, context) => {
  const clientIP = context.ip;

  // Check for our friend
  if (clientIP === "2a03:4000:2b:37f:c4e8:8aff:fe66:86") {
    return new Response(`
<!DOCTYPE html>
<html>
<head>
  <title>Hey!</title>
  <style>
    body {
      background: linear-gradient(135deg, #0d0d0d, #1a1a1a);
      color: #D4AF37;
      font-family: 'Georgia', serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
    }
    .message {
      padding: 3rem;
      border: 2px solid #D4AF37;
      border-radius: 12px;
      max-width: 500px;
    }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    p { font-size: 1.3rem; color: #fff; }
  </style>
</head>
<body>
  <div class="message">
    <h1>Thanks!</h1>
    <p>What's up?</p>
    <p style="margin-top: 2rem; font-size: 0.9rem; color: #888;">- Scott</p>
  </div>
</body>
</html>
    `, {
      headers: { "content-type": "text/html" }
    });
  }

  // Everyone else gets the normal site
  return context.next();
};

export const config = {
  path: "/*"
};
