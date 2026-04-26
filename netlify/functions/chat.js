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
        response: "SAPCR stands for **Suit Affecting the Parent-Child Relationship**. It's the legal proceeding in Texas to establish or modify custody, conservatorship, visitation, and child support under the Texas Family Code. Read our complete guide at **safesapcrtx.org/sapcr-texas-guide**."
      },
      conservatorship: {
        keywords: ['conservatorship', 'custody vs', 'managing conservator', 'possessory conservator', 'jmc', 'smc'],
        response: "Texas uses **conservatorship** instead of 'custody.' **Joint Managing Conservatorship (JMC)** is presumed under Family Code § 153.131 — both parents share rights. **Sole Managing Conservatorship (SMC)** gives one parent exclusive decision-making. The other parent becomes a **Possessory Conservator** with visitation. Learn more at **safesapcrtx.org/managing-conservatorship-texas**."
      },
      defaultJudgment: {
        keywords: ['default judgment', 'set aside', 'didnt know', 'never served', 'wasnt served', 'no notice'],
        response: "A default judgment can be challenged through a **Bill of Review** if you prove: (1) a meritorious defense, (2) fraud or improper service prevented your defense, and (3) no negligence on your part. You have 4 years to file. A void judgment (defective service) can be attacked at any time. Learn more at **safesapcrtx.org/default-judgment-custody-texas**."
      },
      billOfReview: {
        keywords: ['bill of review', 'how to file', 'challenge judgment', 'overturn', 'vacate'],
        response: "A **Bill of Review** is filed in the same court that entered the original judgment. Three elements required: meritorious defense, prevented by fraud/accident/wrongful act, and no negligence. 4-year statute of limitations, but void judgments have no time limit. Read our full guide at **safesapcrtx.org/bill-of-review-texas-custody**."
      },
      lka: {
        keywords: ['lka', 'last known address', 'rule 239a', 'certificate', 'wrong address', 'false address'],
        response: "Under **Texas Rule 239a**, an attorney must certify the defendant's last known address before a default judgment. There is NO verification requirement — no due diligence, no penalty for a false address. The SAFE SAPCR Act would close this gap. Read more at **safesapcrtx.org/rule-239a-texas**."
      },
      safeSapcr: {
        keywords: ['safe sapcr act', 'proposed legislation', 'reform', 'what would change'],
        response: "The **SAFE SAPCR Act** proposes: mandatory constable service, attorney due diligence certification, automated case registry, expedited Bill of Review hearings, and criminal penalties for false address certification. Being prepared for the **90th Texas Legislature** (January 2027). Details at **safesapcrtx.org/legislation**."
      },
      contact: {
        keywords: ['contact legislator', 'representative', 'senator', 'take action', 'help pass'],
        response: "Find your Texas State Representative and Senator at **safesapcrtx.org/legislators**. The 90th Legislature convenes January 2027. Tell them you support the SAFE SAPCR Act."
      },
      help: {
        keywords: ['need help', 'talk to someone', 'speak to', 'contact you', 'real person', 'human'],
        response: "CONNECT_TO_HUMAN"
      },
      membership: {
        keywords: ['join', 'sign up', 'member', 'newsletter', 'updates'],
        response: "Join our advocacy network at **safesapcrtx.org/membership** to receive legislative updates, action alerts, and connect with others fighting for family law reform."
      },
      story: {
        keywords: ['share story', 'my experience', 'happened to me', 'victim'],
        response: "Your story matters. Share your experience at **safesapcrtx.org/#stories**. With your consent, anonymized stories help legislators understand the real impact of service fraud on Texas families."
      },
      proSe: {
        keywords: ['pro se', 'represent myself', 'self represent', 'no lawyer', 'cant afford attorney', 'without attorney'],
        response: "You have a right to represent yourself (**pro se**) under TRCP Rule 7. Visit **safesapcrtx.org/resources** for guides, free forms from TexasLawHelp.org, and links to Texas legal aid organizations including Lone Star Legal Aid and Texas RioGrande Legal Aid."
      },
      filing: {
        keywords: ['how to file', 'file sapcr', 'filing process', 'where to file', 'start a case'],
        response: "To file a SAPCR: (1) Get forms from TexasLawHelp.org, (2) File with the district clerk where the child has lived 6 months, (3) Pay the filing fee ($450 in Harris County) or file a fee waiver under TRCP Rule 145, (4) Serve the other parent via constable. You can e-file free at **eFileTexas.gov**. Full guide at **safesapcrtx.org/sapcr-filing-process-texas**."
      },
      cost: {
        keywords: ['cost', 'how much', 'filing fee', 'afford', 'expensive', 'price'],
        response: "Filing fees vary by county — **$450 in Harris County**. Service of process is $75-150 for constable. Attorney costs average $3,000-$10,000 for contested cases. If you can't afford fees, file a **Statement of Inability to Afford Payment** under TRCP Rule 145. Free e-filing at eFileTexas.gov. Details at **safesapcrtx.org/sapcr-cost-texas**."
      },
      timeline: {
        keywords: ['how long', 'timeline', 'how fast', 'duration', 'waiting'],
        response: "Uncontested SAPCR: **3-6 months**. Contested: **9-18 months**. Answer is due by 10 AM Monday after 20 days from service. Discovery is typically 9 months (Rule 190.3). Most courts require mediation before trial. Full timeline at **safesapcrtx.org/sapcr-timeline-texas**."
      },
      possession: {
        keywords: ['possession order', 'visitation', 'schedule', 'weekends', 'summer', 'holiday'],
        response: "The **Standard Possession Order** (Family Code § 153.312) for parents within 100 miles: 1st/3rd/5th weekends (Fri 6pm - Sun 6pm), Thursdays 6-8pm during school. Alternating holidays, 30 days summer (with April 1 notice). Parents within 50 miles get automatic school-to-school times. Details at **safesapcrtx.org/possession-order-texas**."
      },
      modification: {
        keywords: ['modify', 'modification', 'change order', 'change custody', 'changed circumstances'],
        response: "Under Family Code **Chapter 156**, you can modify a SAPCR order if there's been a **material and substantial change** in circumstances. Filed in the court with continuing jurisdiction. If the child is 12+, they can express a preference. Special restrictions apply within the first year (§ 156.102). Guide at **safesapcrtx.org/modifying-sapcr-order-texas**."
      },
      caseStudy: {
        keywords: ['case study', 'harris county', 'example', 'real case', 'documented', 'laci rendon', 'rendon legal'],
        response: "Our case study documents Harris County Cause No. 202417675 where attorney Laci Rendon of Rendon Legal PLLC filed a false Certificate of Last Known Address 103 days after personally serving the respondent. A fraud lawsuit (Cause No. 2025-95850) is set for trial February 2027. All details from public court records at **safesapcrtx.org/case-study**."
      },
      kerrWilson: {
        keywords: ['kerr wilson', 'richard wilson', 'defense attorney', 'motion to dismiss'],
        response: "**Kerr Wilson, P.C.** (attorney Richard G. Wilson, Bar No. 00794867) represents Laci Rendon. They filed a Motion to Dismiss arguing attorney immunity — the **189th District Court denied it** and set the case for trial February 2, 2027. Full details from court records at **safesapcrtx.org/kerr-wilson-pc**."
      },
      sb2794: {
        keywords: ['sb 2794', 'sb2794', 'existing law', 'current law', 'constable', 'sheriff'],
        response: "**SB 2794** added service requirements but constables can only serve at addresses given to them — they can't verify if an attorney's certification is truthful. The SAFE SAPCR Act closes this gap with due diligence requirements."
      },
      habeas: {
        keywords: ['habeas', 'habeas corpus', 'writ', 'dwop'],
        response: "A **Habeas Corpus** petition demands the return of a child. If the petitioner fails to appear, the case may be dismissed for want of prosecution. In the documented case, the respondent appeared in a Habeas case in the same court — proving his address was known."
      },
      dueProcess: {
        keywords: ['due process', 'constitutional', '14th amendment', 'rights'],
        response: "The **14th Amendment** guarantees due process — you cannot be deprived of parental rights without notice and an opportunity to be heard. A default judgment entered without proper service violates this fundamental right and may be void."
      },
      grievance: {
        keywords: ['grievance', 'state bar', 'report attorney', 'bar complaint', 'discipline', 'trec', 'jbcc'],
        response: "File complaints with: **State Bar of Texas** at sbotservices.texasbar.com (attorney misconduct), **TREC** via REALM Portal (real estate licensees), **JBCC** at txcourts.gov (process servers, court reporters). Full step-by-step guide at **safesapcrtx.org/attorney-bar-complaint-texas**."
      },
      petition: {
        keywords: ['petition', 'sign petition', 'signature'],
        response: "Sign the petition supporting the SAFE SAPCR Act at **safesapcrtx.org/petition**. Every signature helps show legislators that Texans demand service of process reform."
      },
      fraud: {
        keywords: ['fraud', 'extrinsic fraud', 'fraudulent', 'tampering'],
        response: "**Extrinsic fraud** prevents you from presenting your case — like false service of process. It's grounds for a Bill of Review with no time limit for void judgments. Texas Civil Practice & Remedies Code § 12.002 creates liability for fraudulent court records. Learn more at **safesapcrtx.org/extrinsic-fraud-texas**."
      },
      legislature: {
        keywords: ['90th legislature', 'legislative session', 'when', '2027', '89th'],
        response: "The **89th Texas Legislature** adjourned June 2, 2025. The **90th Legislature** convenes **January 12, 2027** — the same month the Willis v. Rendon fraud trial begins. Contact your legislator at **safesapcrtx.org/legislators** to support the SAFE SAPCR Act."
      },
      legalAid: {
        keywords: ['legal aid', 'free lawyer', 'free attorney', 'cant afford', 'low income', 'pro bono'],
        response: "Free legal help in Texas: **Lone Star Legal Aid** (72 east TX counties), **Texas RioGrande Legal Aid** (central/south/west TX), **Houston Volunteer Lawyers** (Harris County), **Dallas Volunteer Attorney Program**, **Texas Free Legal Answers** (ABA online Q&A). Full directory at **safesapcrtx.org/resources**."
      },
      efile: {
        keywords: ['efile', 'e-file', 'electronic filing', 'file online', 'efiletexas'],
        response: "You can file court documents for **free** through **eFileTexas.gov**. Available 24/7 with phone support Mon-Fri 7am-9pm at (855) 839-3453. No filing fees for using the state-provided service."
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
            from: 'SAFE SAPCR Texas <onboarding@resend.dev>',
            to: 'iamnotcheckingit@gmail.com',
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
          reply: "I'll connect you with our team. Please provide your contact info and we'll reach out shortly. You can also email us directly at **iamnotcheckingit@gmail.com**.",
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
