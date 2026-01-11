// GET /api/perjury - Documented false statements vs evidence
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300'
  };

  const perjuryData = {
    lastUpdated: "2026-01-11",
    affidavit: {
      date: "2024-03-19",
      causeNumber: "2024-17675",
      affiant: "Elizabeth Alvarado",
      notary: "Laci Rendon",
      totalFalseStatements: 11
    },

    applicableStatutes: [
      {
        code: "Texas Penal Code § 37.02",
        title: "Perjury",
        classification: "Class A Misdemeanor"
      },
      {
        code: "Texas Penal Code § 37.03",
        title: "Aggravated Perjury",
        classification: "Third Degree Felony",
        note: "Applies when false statement is material to proceeding"
      },
      {
        code: "Texas Penal Code § 32.46",
        title: "Securing Execution of Document by Deception",
        classification: "Varies by value"
      }
    ],

    falseStatements: [
      {
        number: 1,
        claim: "The father disappeared for 9 months with my children",
        sworn: "I am concerned about the safety and welfare of my children... the father of my children disappeared for 9 months with my children.",
        evidence: {
          type: "Hotel receipts",
          description: "Multiple hotel folios show 4 guests registered - both parents and 2 children",
          documents: ["WILLIS_79242.pdf", "WILLIS_79490.pdf", "359716Folio-GST_646035.pdf", "WILLIS_74641.pdf"]
        },
        verdict: "She was on the trips. Hotel records prove 4 guests."
      },
      {
        number: 2,
        claim: "He threatened to kill the children",
        sworn: "The phone conversation led to him threatening to kill the children and told me I had to choose between him or my family.",
        evidence: {
          type: "Absence of documentation",
          description: "No police report, protective order, text messages, or any contemporaneous documentation exists",
          documents: []
        },
        verdict: "Zero evidence. First mention was nearly one year later in custody lawsuit. She continued vacationing with him after alleged threat."
      },
      {
        number: 3,
        claim: "He blocked me from my children",
        sworn: "Scott blocked me from my son's phone so I couldn't call. I went weeks without talking to my children.",
        evidence: {
          type: "Cash App records",
          description: "50+ transactions between parties including $250 payment 'to see my babies'",
          documents: ["CashApp_01_Jan2024_Dec2023.png", "CashApp_02_Nov2023.png", "CashApp_03_Sep2023.png"]
        },
        verdict: "Continuous financial coordination proves ongoing contact, not blocking."
      },
      {
        number: 4,
        claim: "Unenrolled children from school",
        sworn: "He unenrolled them from school",
        evidence: {
          type: "School records",
          description: "Formal TEA-compliant homeschool withdrawal on file"
        },
        verdict: "Legal homeschool withdrawal, not abandonment of education."
      },
      {
        number: 5,
        claim: "Did not educate children",
        sworn: "Did not educate them",
        evidence: {
          type: "Current status",
          description: "Children now described as 'thriving' by Elizabeth's own statements"
        },
        verdict: "No evidence of educational neglect."
      },
      {
        number: 6,
        claim: "Kept children in random places",
        sworn: "Random places",
        evidence: {
          type: "Hotel records",
          description: "Marriott extended-stay hotels with full kitchens, pools, family amenities"
        },
        verdict: "Reputable hotel chains, not 'random places'."
      },
      {
        number: 7,
        claim: "Dangerous circumstances",
        sworn: "Dangerous circumstances",
        evidence: {
          type: "Hotel records and photos",
          description: "Daily swimming, family vacations, documented activities"
        },
        verdict: "Normal family vacation activities documented."
      },
      {
        number: 8,
        claim: "Exposed children to drugs",
        sworn: "Exposed to drugs",
        evidence: {
          type: "Absence of evidence",
          description: "Zero evidence of any kind"
        },
        verdict: "Completely unsubstantiated allegation."
      },
      {
        number: 9,
        claim: "Went weeks without talking to children",
        sworn: "I went weeks without talking to my children",
        evidence: {
          type: "Hotel records",
          description: "She was staying in hotels with them during the alleged period"
        },
        verdict: "Hotel records show she was physically present."
      },
      {
        number: 10,
        claim: "Children wanted to leave",
        sworn: "Kids wanted to leave",
        evidence: {
          type: "Witness accounts",
          description: "Children did not want to leave father"
        },
        verdict: "Contradicted by circumstances of separation."
      },
      {
        number: 11,
        claim: "Scott was controlling",
        sworn: "Scott controlled",
        evidence: {
          type: "Cash App records",
          description: "Elizabeth demanded double repayment of amounts"
        },
        verdict: "Financial records show Elizabeth making demands."
      }
    ],

    keyEvidence: {
      knownAddress: {
        date: "2023-12-27",
        address: "8918 Heaton St., New Orleans, LA 70118",
        source: "Habeas Corpus filing - Cause No. 2023-53496",
        significance: "Proves she knew his actual address 7 months before false certificate"
      },
      hotelFolios: [
        { id: "79242", hotel: "TownePlace Suites Baytown", dates: "June 16-19, 2023", guests: 4 },
        { id: "79490", hotel: "TownePlace Suites Baytown", dates: "June 30 - July 2, 2023", guests: 4 },
        { id: "79654", hotel: "TownePlace Suites Baytown", dates: "July 2-3, 2023", guests: null },
        { id: "74641", hotel: "TownePlace Suites I-10 East", dates: "Sept 27 - Oct 1, 2023", guests: 4 },
        { id: "646035", hotel: "Aloft New Orleans", dates: "July 14-16, 2023", guests: 4 },
        { id: "705140", hotel: "Aloft New Orleans", dates: "Aug 19-20, 2023", guests: null }
      ],
      ambushNote: "The same TownePlace Suites Baytown where they frequently stayed together is where she later ambushed him to take the children."
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(perjuryData, null, 2)
  };
};
