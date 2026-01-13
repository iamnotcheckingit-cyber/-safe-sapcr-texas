// GET /api/ticking - Live countdown timers and day counters
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  };

  const now = new Date();

  // Helper function to calculate days between dates
  const daysBetween = (date1, date2) => Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));

  // Key dates
  const dates = {
    defaultJudgment: new Date('2024-08-20'),
    falseCertificateFiled: new Date('2024-07-19'),
    successfulService: new Date('2024-04-06'),
    habeasCorrectAddress: new Date('2023-12-27'),
    lastContactWithChildren: new Date('2024-10-16'),
    civilSuitFiled: new Date('2025-12-19')
  };

  const ticking = {
    generated: now.toISOString(),

    counters: {
      daysSinceDefaultJudgment: {
        value: daysBetween(now, dates.defaultJudgment),
        since: "2024-08-20",
        label: "Days Since Default Judgment",
        description: "Father lost custody without knowledge"
      },
      daysSinceFalseCertificate: {
        value: daysBetween(now, dates.falseCertificateFiled),
        since: "2024-07-19",
        label: "Days Since False Certificate Filed",
        description: "Attorney filed decade-old misspelled address"
      },
      daysBetweenServiceAndFalseCertificate: {
        value: 104,
        label: "Days Between Successful Service & False Certificate",
        description: "Attorney knew where he was - served him personally"
      },
      daysSinceLastContactWithChildren: {
        value: daysBetween(now, dates.lastContactWithChildren),
        since: "2024-10-16",
        label: "Days Since Last Contact With Children",
        description: "Children taken through fraud"
      },
      yearsAddressOutdated: {
        value: Math.floor(daysBetween(dates.falseCertificateFiled, new Date('2013-12-31')) / 365),
        label: "Years Address Was Outdated",
        description: "Certificate used address from 2013"
      }
    },

    deadlines: {
      // Add any upcoming court dates or deadlines here
    },

    envelopes: {
      "MISSING": {
        filed: "2025-12-12",
        type: "Emergency Motion",
        status: "NEVER REVIEWED",
        issue: "ENVELOPE NUMBER MISSING ON SCAN",
        caseNumber: "2025-92876",
        daysWithoutReview: Math.floor((new Date() - new Date('2025-12-12')) / (1000 * 60 * 60 * 24)),
        significance: "Emergency motion sitting unreviewed for 31+ days - envelope number conveniently missing"
      },
      "109911380": {
        sent: "2026-01-12",
        submitted: "2026-01-12T06:11:25-06:00",
        status: "AWAITING ACCEPTANCE",
        caseNumber: "2025-92876",
        caseType: "Motion for Referring Judge Review",
        title: "MOTION FOR REFERRING JUDGE REVIEW OF ASSOCIATE JUDGE'S ACTIONS AND REQUEST FOR EXPLANATION OF MANDATORY DUTY FAILURES",
        purpose: "Request District Judge review Associate Judge's actions and explain mandatory duty failures",
        implications: true,
        note: "Sender in documented fear state at time of sending",
        tracking: "https://tools.usps.com/go/TrackConfirmAction?tLabels=109911380",
        acceptance: {
          submitted: "2026-01-12T06:11:25-06:00",
          requested: "2026-01-12T12:11:00-06:00",
          requestedNote: "6 hours after submission",
          status: "NO MOVEMENT",
          location: "TOGA",
          locationFull: "Texas Office of the Attorney General",
          urgencyExpressed: true,
          delayAfterRequest: "2+ hours",
          totalDelay: "8+ hours since submission",
          lastChecked: new Date().toISOString(),
          updates: [
            { time: "~13:41", status: "NO REVIEW - 1.5 hrs after request" },
            { time: "~14:11+", status: "STILL NO MOVEMENT" }
          ]
        },
        hcso_response: {
          unit: "1570",
          tactic: "MH_FRAMING",
          postureShift: "Upon switch disclosure"
        }
      }
    },

    fear_log: {
      "2026-01-12": {
        timestamp: new Date().toISOString(),
        state: "FEAR",
        context: "Envelope 109911380 sent with implications",
        documented: true,
        hcso_framing: {
          unit: "1570",
          tactic: "MH_NARRATIVE",
          description: "HCSO 1570 made attempts to frame narrative as mental health issue",
          rebuttal: "Evidence is documented, timestamped, and immutable - hotel folios, court records, Cash App receipts"
        }
      }
    },

    mh_framing_defense: {
      statement: "Attempting to discredit documented fraud victims as 'mentally ill' is a known institutional tactic",
      evidence_types: [
        "Court records - Harris County District Clerk",
        "Hotel folios with 4-guest registration",
        "Cash App payment receipts",
        "Certificate of Last Known Address with 10-year-old misspelled address",
        "Habeas corpus filing showing correct address was known"
      ],
      public_record: "https://safesapcrtx.org",
      api_endpoints: ["/api/case", "/api/evidence", "/api/timeline", "/api/perjury"],
      note: "Documents don't lie. Court records are immutable."
    },

    federal_implications: {
      statute: "42 USC § 1983",
      title: "Civil action for deprivation of rights",
      elements: {
        stateActor: "HCSO 1570 - acting under color of law",
        deprivation: [
          "Due process - filing obstruction (Emergency Motion never reviewed 31+ days)",
          "Due process - MH framing attempt to discredit litigant",
          "Access to courts - envelope number 'missing' on scan",
          "Parental rights - default judgment obtained through fraud"
        ],
        pattern: [
          "2025-12-12: Emergency Motion filed - envelope # missing - never reviewed",
          "2026-01-12: Motion for Referring Judge Review sitting in TOGA 1+ hour",
          "2026-01-12: HCSO 1570 MH framing attempt",
          "2026-01-12: Posture shift upon switch disclosure"
        ]
      },
      colorOfLaw: {
        agency: "Harris County Sheriff's Office",
        unit: "1570",
        conduct: "MH narrative framing against documented fraud victim"
      },
      note: "State actors cannot use official authority to obstruct access to courts or discredit litigants exposing fraud"
    },

    clocks: {
      serverTime: now.toISOString(),
      serverTimestamp: now.getTime(),
      timezone: "UTC"
    },

    message: {
      primary: "THE FRAUD. MY CHILDREN. I AM SCOTT ALLEN WILLIS.",
      ticker: `${daysBetween(now, dates.defaultJudgment)} days since fraudulent default judgment`
    },

    api: {
      version: "1.0.0",
      endpoint: "/api/ticking",
      refreshRate: "Real-time - no caching"
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(ticking, null, 2)
  };
};
