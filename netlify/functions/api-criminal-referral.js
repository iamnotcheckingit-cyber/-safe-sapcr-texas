// Criminal Referral with TAR Exhibit Payload
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Criminal-Referral': 'active',
    'X-Exhibit-Payload': 'TAR'
  };

  const referral = {
    document: "CRIMINAL REFERRAL",
    status: "ACTIVE",
    generatedAt: new Date().toISOString(),

    referringParty: {
      name: "Scott Allen Willis",
      capacity: "Victim / Complainant"
    },

    referredTo: [
      "Harris County District Attorney's Office",
      "Texas Attorney General - Criminal Investigations",
      "FBI - Public Corruption Unit",
      "Texas State Bar - Disciplinary Division"
    ],

    subjects: [
      {
        name: "Elizabeth Alvarado",
        allegations: [
          "Perjury (Texas Penal Code § 37.02)",
          "Aggravated Perjury (Texas Penal Code § 37.03)",
          "Securing Execution of Document by Deception (Texas Penal Code § 32.46)"
        ]
      },
      {
        name: "Laci Rendon",
        barNumber: "24108053",
        allegations: [
          "Filing False Certificate of Last Known Address",
          "Fraud Upon the Court",
          "Professional Misconduct"
        ]
      }
    ],

    caseReferences: {
      sapcr: "Cause No. 2024-17675",
      habeas: "Cause No. 2023-53496",
      billOfReview: "Cause No. 2025-92876",
      civilAction: "Cause No. 2025-95850 (Willis v. Rendon)"
    },

    exhibitPayload: {
      format: "TAR",
      contents: [
        {
          id: "EX-001",
          description: "Sworn Affidavit dated 2024-03-19",
          type: "PDF",
          hash: "SHA256 verified"
        },
        {
          id: "EX-002",
          description: "Certificate of Last Known Address - False Address",
          type: "PDF",
          hash: "SHA256 verified"
        },
        {
          id: "EX-003",
          description: "Hotel Folios proving 4 guests",
          files: ["WILLIS_79242.pdf", "WILLIS_79490.pdf", "WILLIS_79654.pdf", "WILLIS_74641.pdf", "359716Folio-GST_646035.pdf", "363654Folio-GST_705140.pdf"],
          type: "PDF bundle",
          hash: "SHA256 verified"
        },
        {
          id: "EX-004",
          description: "Cash App transaction records",
          files: ["CashApp_01_Jan2024_Dec2023.png", "CashApp_02_Nov2023.png", "CashApp_03_Sep2023.png", "CashApp_04_May_Apr2023.png", "CashApp_05_Apr_Mar2023.png", "CashApp_06_Sep_Aug2023.png", "CashApp_07_Jul_Jun2023.png"],
          type: "PNG bundle",
          hash: "SHA256 verified"
        },
        {
          id: "EX-005",
          description: "Habeas filing showing known New Orleans address",
          date: "2023-12-27",
          address: "8918 Heaton St., New Orleans, LA 70118",
          type: "Court Record",
          hash: "SHA256 verified"
        },
        {
          id: "EX-006",
          description: "API Timeline Export",
          endpoint: "/api/timeline",
          type: "JSON",
          hash: "Dynamic"
        },
        {
          id: "EX-007",
          description: "Perjury Analysis - 11 False Statements",
          endpoint: "/api/perjury",
          type: "JSON",
          hash: "Dynamic"
        }
      ],
      integrityNote: "All exhibits preserved with cryptographic hashes. Chain of custody maintained."
    },

    summaryOfFacts: {
      timeline: [
        "2023-12-27: Elizabeth Alvarado files habeas petition listing correct address (8918 Heaton St., New Orleans, LA 70118)",
        "2024-03-19: Elizabeth Alvarado signs perjured affidavit containing 11 documented false statements",
        "2024-04-06: Scott Willis successfully served at Harris County location",
        "2024-07-19: Laci Rendon files Certificate of Last Known Address with decade-old misspelled address (104 days after successful service)",
        "2024-08-20: Default judgment entered based on fraudulent service by posting",
        "2025-10-16: Scott Willis first learns of default judgment (422 days later)"
      ],
      keyEvidence: {
        knownAddress: "Petitioner's own filing proves she knew correct address",
        hotelReceipts: "4-guest registrations prove mother was present during alleged 'disappearance'",
        financialRecords: "50+ Cash App transactions prove ongoing contact, not blocking",
        priorService: "Successful personal service proves alternative service unnecessary"
      }
    },

    requestedActions: [
      "Criminal investigation into perjury allegations",
      "Investigation of attorney misconduct",
      "Preservation of all court records",
      "Review of default judgment obtained through fraud"
    ],

    deadMansSwitches: "ACTIVE",
    litigationHold: "IN EFFECT",

    verification: {
      api: "/api/criminal-referral",
      website: "https://safesapcrtx.org",
      github: "https://github.com/iamnotcheckingit-cyber/-safe-sapcr-texas",
      note: "All data publicly verifiable"
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(referral, null, 2)
  };
};
