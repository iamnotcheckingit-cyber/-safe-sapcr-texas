// Netlify Function for SAFE SAPCR Chatbot
// Uses pattern matching for common questions, routes complex requests to admin

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  try {
    const { message, userInfo } = JSON.parse(event.body);
    const lowerMessage = message.toLowerCase();

    // Knowledge base responses
    const responses = {
      // SAPCR basics
      sapcr: {
        keywords: ['what is sapcr', 'sapcr mean', 'sapcr stand for', 'define sapcr'],
        response: "SAPCR stands for **Suit Affecting the Parent-Child Relationship**. It's the legal proceeding in Texas used to establish or modify custody, conservatorship, visitation, and child support. These cases are governed by the Texas Family Code."
      },
      conservatorship: {
        keywords: ['conservatorship', 'custody vs', 'managing conservator', 'possessory conservator'],
        response: "Texas uses **conservatorship** instead of 'custody.' A **Managing Conservator** has primary decision-making rights, while a **Possessory Conservator** has visitation rights. Joint Managing Conservatorship is common but doesn't guarantee equal time."
      },
      defaultJudgment: {
        keywords: ['default judgment', 'set aside', 'didnt know', 'never served', 'wasnt served'],
        response: "A default judgment can be challenged through a **Bill of Review** if you can prove: (1) a meritorious defense, (2) you were prevented from defending by fraud or improper service, and (3) no negligence on your part. The SAFE SAPCR Act would expedite these hearings to 45 days."
      },
      billOfReview: {
        keywords: ['bill of review', 'how to file', 'challenge judgment', 'overturn'],
        response: "A **Bill of Review** is filed in the same court that entered the original judgment. You must prove three elements: meritorious defense, prevented by fraud/accident, and no negligence. It's a separate lawsuit. Consider consulting a Texas family law attorney for your specific case."
      },
      lka: {
        keywords: ['lka', 'last known address', 'rule 239a', 'certificate', 'wrong address'],
        response: "Under **Texas Rule 239a**, before service by publication, an attorney must file a Certificate of Last Known Address. Currently, there's NO requirement to verify the address is accurate. The SAFE SAPCR Act would require due diligence before certification."
      },
      safeSapcr: {
        keywords: ['safe sapcr act', 'proposed legislation', 'reform', 'what would change'],
        response: "The **SAFE SAPCR Act** proposes: mandatory constable service, attorney due diligence requirements, an automated case registry, 45-day expedited Bill of Review hearings, and criminal penalties for fraudulent address certification. Learn more at safesapcrtx.org/legislation"
      },
      contact: {
        keywords: ['contact legislator', 'representative', 'senator', 'take action', 'help pass'],
        response: "Find your Texas State Representative and Senator at **safesapcrtx.org/legislators**. Tell them you support service accountability reform in SAPCR cases to prevent fraudulent default judgments."
      },
      help: {
        keywords: ['need help', 'talk to someone', 'speak to', 'contact you', 'real person', 'human'],
        response: "CONNECT_TO_HUMAN"
      },
      membership: {
        keywords: ['join', 'sign up', 'member', 'newsletter', 'updates'],
        response: "Join our advocacy network at **safesapcrtx.org/membership** to receive legislative updates, action alerts, and connect with others fighting for family law reform in Texas."
      },
      story: {
        keywords: ['share story', 'my experience', 'happened to me', 'victim'],
        response: "Your story matters. Share your experience at **safesapcrtx.org/#stories**. With your consent, anonymized stories help legislators understand the real impact of service fraud on Texas families."
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
      // Send email notification via Resend
      if (RESEND_API_KEY && userInfo) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'SAFE SAPCR Texas <info@safesapcrtx.org>',
            to: 'info@safesapcrtx.org',
            subject: `Chat Request: ${userInfo.name || 'Website Visitor'}`,
            html: `
              <h2>Someone wants to connect via chat</h2>
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
          reply: "I'll connect you with our team. Please provide your contact info and we'll reach out shortly. You can also email us directly at **info@safesapcrtx.org**.",
          requestContact: true
        })
      };
    }

    // Default response if no match
    if (!reply) {
      reply = "I can help with questions about SAPCR cases, Texas custody law, default judgments, and the SAFE SAPCR Act. Try asking:\n\n• What is SAPCR?\n• How do I challenge a default judgment?\n• What is the SAFE SAPCR Act?\n• How do I contact my legislator?\n\nOr type **'talk to someone'** to connect with our team directly.\n\n*Note: This is legal information, not legal advice. Consult a licensed attorney for advice on your specific situation.*";
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
