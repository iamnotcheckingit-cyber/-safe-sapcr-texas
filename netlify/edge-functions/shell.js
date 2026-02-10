export default async (request, context) => {
  const attackerIP = context.ip;
  
  console.log(`shell.php probe from ${attackerIP}`);
  
  // Redirect to their own IP
  return Response.redirect(`http://${attackerIP}/shell.php`, 301);
};

export const config = {
  path: "/shell.php"
};