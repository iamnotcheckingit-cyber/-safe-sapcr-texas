// Fast tor-detection function
// Returns immediately without any actual detection

exports.handler = async (event, context) => {
  // Log the request for monitoring
  console.log('tor-detection called from:', context.clientContext?.ip || 'unknown');
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    },
    body: JSON.stringify({
      allowed: true,
      timestamp: Date.now()
    })
  };
};
