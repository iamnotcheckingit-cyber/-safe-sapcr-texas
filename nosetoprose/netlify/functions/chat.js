// Netlify Function for No Se to Pro Se Chatbot
// Uses pattern matching for common questions, routes complex requests to admin

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  try {
    const { message, userInfo } = JSON.parse(event.body);
    const lowerMessage = message.toLowerCase();

    // Knowledge base responses for Pro Se resources
    const responses = {
      sapcr: {
        keywords: ['what is sapcr', 'sapcr mean', 'sapcr stand for', 'define sapcr'],
        response: "SAPCR stands for **Suit Affecting the Parent-Child Relationship**. It's the legal proceeding in Texas used to establish or modify custody (conservatorship), visitation (possession and access), and child support."
      },
      prose: {
        keywords: ['pro se', 'represent myself', 'without attorney', 'self represent', 'no lawyer'],
        response: "**Pro se** means representing yourself in court without an attorney. It's your constitutional right. Our site provides guides, forms, and resources to help you navigate Texas family court on your own."
      },
      conservatorship: {
        keywords: ['conservatorship', 'custody', 'managing conservator', 'possessory'],
        response: "Texas uses **conservatorship** instead of 'custody.' A **Managing Conservator** has primary decision-making rights. A **Possessory Conservator** has visitation rights. The court decides based on the child's best interest."
      },
      filing: {
        keywords: ['how to file', 'file sapcr', 'start custody', 'begin case', 'original petition'],
        response: "To file an original SAPCR: 1) Draft a petition using proper format, 2) File with your county's district clerk, 3) Pay filing fee (or file an affidavit of indigence), 4) Serve the other party properly. Check our guides section for detailed steps."
      },
      answer: {
        keywords: ['answer petition', 'been served', 'respond to', 'deadline', 'how long to answer'],
        response: "After being served, you must file an Answer by **10am on the first Monday after 20 days** from service. Don't miss this deadline or you risk a default judgment. You can also file a Counter-Petition if you want to request different orders."
      },
      modification: {
        keywords: ['modify', 'change order', 'modification', 'material change'],
        response: "To modify an existing order, you must show a **material and substantial change in circumstances** since the last order. File a Petition to Modify in the court that issued the original order. Chapter 156 of the Texas Family Code governs modifications."
      },
      billOfReview: {
        keywords: ['bill of review', 'default judgment', 'set aside', 'never served', 'wasnt notified'],
        response: "A **Bill of Review** can set aside a default judgment if you prove: 1) meritorious defense, 2) prevented by fraud or improper service, 3) no negligence on your part. Visit **safesapcrtx.org** for more on service fraud issues."
      },
      discovery: {
        keywords: ['discovery', 'interrogatories', 'request for production', 'deposition'],
        response: "**Discovery** lets you request information from the other party. Types include: Interrogatories (written questions), Requests for Production (documents), Requests for Admission, and Depositions (oral questioning). You have 30 days to respond to discovery."
      },
      forms: {
        keywords: ['forms', 'templates', 'where to get', 'sample petition'],
        response: "Check our **Forms & Templates** section for sample pleadings. Also visit **txcourts.gov/rules-forms** for official court forms. Your local district clerk may have county-specific forms as well."
      },
      help: {
        keywords: ['need help', 'talk to someone', 'speak to', 'contact you', 'real person', 'human', 'call me'],
        response: "CONNECT_TO_HUMAN"
      },
      lawyer: {
        keywords: ['find lawyer', 'need attorney', 'hire lawyer', 'legal aid'],
        response: "If you need an attorney, try: **Texas Lawyer Referral Service** (texasbar.com), **Legal Aid of NorthWest Texas**, or your local bar association. Many offer free consultations or sliding scale fees."
      }
    };

    // Check for matching response
    let reply = null;
    for (const [key, data] of Object.entries(responses)) {
      if (data.keywords.some(kw => lowerMessage.includes(kw))) {
        reply = data.response;
        break;
      }
    }

    // Handle human connection request
    if (reply === 'CONNECT_TO_HUMAN') {
      if (RESEND_API_KEY && userInfo) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'No Se to Pro Se <info@nosetoprose.org>',
            to: 'info@safesapcrtx.org',
            subject: `Chat Request (NoSeToProse): ${userInfo.name || 'Website Visitor'}`,
            html: `
              <h2>Someone wants to connect via nosetoprose.org chat</h2>
              <p><strong>Name:</strong> ${userInfo.name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${userInfo.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${userInfo.phone || 'Not provided'}</p>
              <p><strong>Message:</strong> ${message}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
            `
          })
        });
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply: "I'll connect you with our team. Please provide your contact info and we'll reach out shortly.",
          requestContact: true
        })
      };
    }

    // Default response if no match
    if (!reply) {
      reply = "I can help with pro se SAPCR questions! Try asking:\n\n• What is SAPCR?\n• How do I represent myself?\n• How do I file a case?\n• What's the deadline to answer?\n• How do I modify an order?\n\nOr type **'talk to someone'** to connect with our team.\n\n*Note: This is legal information, not legal advice. Consult a licensed attorney for advice on your specific situation.*";
    } else {
      // Add disclaimer to all responses
      reply += "\n\n*This is legal information, not legal advice.*";
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error('Chat error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Chat service error' })
    };
  }
};
