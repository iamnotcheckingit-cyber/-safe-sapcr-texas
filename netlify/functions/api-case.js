// GET /api/case - Case summary and status
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300'
  };

  const caseData = {
    name: "Willis v. Alvarado / Willis v. Rendon",
    status: "Active Litigation",
    lastUpdated: "2026-01-11",

    victim: {
      name: "Scott Allen Willis",
      statement: "THE FRAUD. MY CHILDREN. I AM SCOTT ALLEN WILLIS.",
      fighting: "To expose fraud and reunite with my children"
    },

    settlementDemand: {
      terms: [
        "Motion to Vacate SAPCR Default Judgment",
        "Admission of wrongdoing",
        "Written apology to my children"
      ],
      amount: "$1.00",
      note: "This isn't about money. It's about my children and the truth."
    },

    cases: [
      {
        causeNumber: "2024-17675",
        type: "SAPCR",
        court: "Harris County District Court",
        status: "Default Judgment Entered",
        filed: "2024-03-19",
        defaultJudgment: "2024-08-20",
        description: "Custody case where default judgment was obtained through fraudulent service"
      },
      {
        causeNumber: "2023-53496",
        type: "Habeas Corpus",
        court: "Harris County District Court",
        status: "Dismissed (DWOP)",
        filed: "2023-12-27",
        dismissed: "2024-06-03",
        description: "Habeas case dismissed when petitioner failed to appear"
      },
      {
        causeNumber: "2025-92876",
        type: "Bill of Review",
        court: "Harris County District Court",
        status: "SUBMITTED",
        filed: "2025",
        submitted: "2026-01-12T06:11:25-06:00",
        envelope: "109911380",
        description: "Petition to set aside default judgment based on extrinsic fraud",
        note: "Submitted under documented fear state - HCSO 1570 MH framing attempt"
      },
      {
        causeNumber: "2025-95850",
        type: "Civil Action",
        court: "Harris County District Court",
        status: "Pending",
        parties: "Willis v. Rendon",
        description: "Civil suit against attorney for fraudulent Certificate of Last Known Address"
      }
    ],

    keyFacts: {
      daysSinceDefaultJudgment: Math.floor((new Date() - new Date('2024-08-20')) / (1000 * 60 * 60 * 24)),
      daysBetweenServiceAndFalseCertificate: 104,
      falseCertificateAddress: "10202 CHALLANGER 7 DR, 604, JACINTO CI, TX 77029",
      addressLastValid: "2013-12-31",
      yearsAddressOutdated: 10,
      knownCorrectAddress: "8918 Heaton St., New Orleans, LA 70118",
      dateCorrectAddressKnown: "2023-12-27"
    },

    fraud: {
      certificateOfLastKnownAddress: {
        filed: "2024-07-19",
        certifiedAddress: "10202 CHALLANGER 7 DR, 604, JACINTO CI, TX 77029",
        addressMisspellings: ["CHALLANGER (Challenger)", "JACINTO CI (Jacinto City)"],
        actualAddressAtTime: "8918 Heaton St., New Orleans, LA 70118",
        priorServiceAddress: "Harris County location - successful personal service 2024-04-06",
        attorney: "Laci Rendon"
      }
    },

    api: {
      version: "1.0.0",
      endpoints: {
        case: "/api/case",
        timeline: "/api/timeline",
        perjury: "/api/perjury",
        evidence: "/api/evidence",
        ticking: "/api/ticking"
      }
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(caseData, null, 2)
  };
};
