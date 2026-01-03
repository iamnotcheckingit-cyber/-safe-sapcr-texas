// Netlify Function for SAFE SAPCR Chatbot
// Uses pattern matching for common questions, routes complex requests to admin

// Security headers for all responses
const securityHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache'
};

// Input sanitization - remove potential XSS and injection attempts
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>"'&]/g, (char) => { // Escape special chars
      const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
      return entities[char] || char;
    })
    .slice(0, 1000); // Limit length
}

// Validate email format
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: securityHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Check origin (basic CORS protection)
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigins = ['https://safesapcrtx.org', 'https://www.safesapcrtx.org'];
  if (origin && !allowedOrigins.some(o => origin.startsWith(o)) && !origin.includes('netlify.app')) {
    return { statusCode: 403, headers: securityHeaders, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  try {
    // Parse and validate input
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const message = sanitizeInput(body.message || '');
    const userInfo = body.userInfo ? {
      name: sanitizeInput(body.userInfo.name || ''),
      email: sanitizeInput(body.userInfo.email || ''),
      phone: sanitizeInput(body.userInfo.phone || '').replace(/[^\d\s\-\+\(\)]/g, '').slice(0, 20)
    } : {};

    // Validate message exists
    if (!message || message.length < 1) {
      return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'Message required' }) };
    }
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
        keywords: ['default judgment', 'set aside', 'didnt know', 'never served', 'wasnt served', 'no notice'],
        response: "A default judgment can be challenged through a **Bill of Review** if you can prove: (1) a meritorious defense, (2) you were prevented from defending by fraud or improper service, and (3) no negligence on your part. The SAFE SAPCR Act would expedite these hearings to 45 days."
      },
      billOfReview: {
        keywords: ['bill of review', 'how to file', 'challenge judgment', 'overturn', 'vacate'],
        response: "A **Bill of Review** is filed in the same court that entered the original judgment. You must prove three elements: meritorious defense, prevented by fraud/accident, and no negligence. It's a separate lawsuit. Consider consulting a Texas family law attorney for your specific case."
      },
      lka: {
        keywords: ['lka', 'last known address', 'rule 239a', 'certificate', 'wrong address', 'false address'],
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
      },
      // New topics - Pro Se
      proSe: {
        keywords: ['pro se', 'represent myself', 'self represent', 'no lawyer', 'cant afford attorney', 'without attorney'],
        response: "You have a constitutional right to represent yourself (**pro se**) in civil court. Visit **safesapcrtx.org/resources** for our 'No Sé to Pro Se' guide with tips, resources, and links to Texas Courts Self-Help Center and TexasLawHelp.org."
      },
      californiaBar: {
        keywords: ['california bar', 'become lawyer', 'law school', 'bar exam', 'attorney without'],
        response: "California allows taking the Bar Exam without law school through the **Law Office Study Program** - 4 years of apprenticeship under a supervising attorney. Learn more at **safesapcrtx.org/resources**."
      },
      // Case study
      caseStudy: {
        keywords: ['case study', 'harris county', 'example', 'real case', 'documented'],
        response: "Our case study documents a real Harris County case where an attorney filed a false Certificate of Last Known Address 104 days after personally serving the respondent. Read the full timeline at **safesapcrtx.org/case-study**."
      },
      // SB 2794
      sb2794: {
        keywords: ['sb 2794', 'sb2794', 'existing law', 'current law', 'constable', 'sheriff'],
        response: "**SB 2794** added service requirements but has no teeth—constables and sheriffs can only serve papers at addresses given to them. They can't verify if an attorney's certification is truthful. The SAFE SAPCR Act closes this gap."
      },
      // Habeas
      habeas: {
        keywords: ['habeas', 'habeas corpus', 'writ', 'dwop'],
        response: "A **Habeas Corpus** petition in custody cases demands the return of a child. If the petitioner fails to appear, the case may be **DWOP'd** (Dismissed for Want of Prosecution). These cases can reveal an attorney's knowledge of correct addresses."
      },
      // Due process
      dueProcess: {
        keywords: ['due process', 'constitutional', '14th amendment', 'rights'],
        response: "The **14th Amendment** guarantees due process—you cannot be deprived of liberty (including parental rights) without notice and an opportunity to be heard. Service fraud violates this fundamental right."
      },
      // Attorney grievance
      grievance: {
        keywords: ['grievance', 'state bar', 'report attorney', 'bar complaint', 'discipline'],
        response: "You can file a grievance against an attorney with the **State Bar of Texas** at texasbar.com. Document specific rule violations with evidence. False certifications may violate professional conduct rules."
      },
      // Petition
      petition: {
        keywords: ['petition', 'sign petition', 'signature'],
        response: "Sign our petition to show legislators that Texans demand service of process reform. Every signature helps! Visit **safesapcrtx.org/petition**."
      },
      // Fraud
      fraud: {
        keywords: ['fraud', 'extrinsic fraud', 'fraudulent', 'tampering'],
        response: "**Extrinsic fraud** prevents you from presenting your case—like false service of process. It's grounds for a Bill of Review. **Texas Penal Code §37.10** (Tampering with Governmental Records) may apply to false court filings."
      },
      // 89th Legislature
      legislature: {
        keywords: ['89th legislature', 'legislative session', 'when', '2025'],
        response: "The **89th Texas Legislature** convenes January 14, 2025. This is our window to pass the SAFE SAPCR Act. Contact your legislator NOW at **safesapcrtx.org/legislators**."
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
        headers: securityHeaders,
        body: JSON.stringify({
          reply: "I'll connect you with our team. Please provide your contact info and we'll reach out shortly. You can also email us directly at **info@safesapcrtx.org**.",
          requestContact: true
        })
      };
    }

    // Default response if no match
    if (!reply) {
      reply = "I can help with questions about Texas family law and the SAFE SAPCR Act. Try asking:\n\n**Basics:**\n• What is SAPCR?\n• What is conservatorship?\n\n**If you were never served:**\n• How do I challenge a default judgment?\n• What is a Bill of Review?\n• What is Rule 239a?\n\n**Take Action:**\n• What is the SAFE SAPCR Act?\n• How do I contact my legislator?\n• How can I represent myself (pro se)?\n\n**Learn More:**\n• Tell me about the Harris County case study\n• Why doesn't SB 2794 help?\n• How do I file a State Bar grievance?\n\nOr type **'talk to someone'** to connect with our team.\n\n*Note: This is legal information, not legal advice. Consult a licensed attorney for your specific situation.*";
    } else {
      // Add disclaimer to all responses
      reply += "\n\n*This is legal information, not legal advice.*";
    }

    return {
      statusCode: 200,
      headers: securityHeaders,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error('Chat error:', error);
    return {
      statusCode: 500,
      headers: securityHeaders,
      body: JSON.stringify({ error: 'Chat service error' })
    };
  }
};
