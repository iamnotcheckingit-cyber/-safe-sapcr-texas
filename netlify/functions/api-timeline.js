// GET /api/timeline - Chronological case events
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300'
  };

  const timeline = {
    lastUpdated: "2026-01-11",
    events: [
      {
        date: "2013-09-13",
        type: "prior_case",
        title: "Case 191853401010 Filed",
        description: "Earlier case with misspelled address: 10202 CHALLANGER 7 DR, 604, JACINTO CI, TX 77029",
        disposition: "Dismissed",
        significance: "Same misspelled address used 10+ years later in false certificate"
      },
      {
        date: "2013-12-31",
        type: "address",
        title: "Last Date at Challenger 7 Address",
        description: "Scott Willis last resided at the Challenger 7 Drive address",
        significance: "Certificate of Last Known Address filed 10+ years after this date"
      },
      {
        date: "2023-06-16",
        type: "evidence",
        title: "Hotel Stay - TownePlace Suites Baytown",
        description: "Family stay with 4 guests registered",
        evidence: "Folio 79242",
        significance: "Contradicts claim of 'disappearance' - mother was present"
      },
      {
        date: "2023-07-14",
        type: "evidence",
        title: "Hotel Stay - Aloft New Orleans",
        description: "Family vacation with 4 guests registered",
        evidence: "Folio 646035",
        significance: "Contradicts claim of 'disappearance' - mother was present"
      },
      {
        date: "2023-09-27",
        type: "evidence",
        title: "Hotel Stay - TownePlace Suites Houston",
        description: "Extended stay with 4 guests registered",
        evidence: "Folio 74641",
        significance: "Contradicts claim of 'disappearance' - mother was present"
      },
      {
        date: "2023-11-01",
        type: "evidence",
        title: "Cash App Payment",
        description: "Elizabeth paid Scott $250 with note 'to see my babies'",
        significance: "Proves ongoing contact and coordination, contradicts 'blocked' claim"
      },
      {
        date: "2023-12-27",
        type: "court",
        title: "Habeas Corpus Filed - Correct Address Provided",
        description: "Elizabeth Alvarado requests service at 8918 Heaton St., New Orleans, LA 70118",
        causeNumber: "2023-53496",
        significance: "Proves she knew his actual address before false certificate was filed"
      },
      {
        date: "2024-03-19",
        type: "court",
        title: "SAPCR Petition Filed with Sworn Affidavit",
        description: "Elizabeth Alvarado signs affidavit making multiple false claims",
        causeNumber: "2024-17675",
        notary: "Laci Rendon",
        significance: "Affidavit contains 11 documented false statements"
      },
      {
        date: "2024-04-06",
        type: "service",
        title: "Successful Personal Service",
        description: "Scott Willis personally served with SAPCR petition at Harris County location",
        significance: "Proves service was possible - no need for alternative service"
      },
      {
        date: "2024-04-28",
        type: "communication",
        title: "First Email to Petitioner's Attorney",
        description: "Scott emailed attorney requesting service documents",
        response: "None"
      },
      {
        date: "2024-06-03",
        type: "court",
        title: "Habeas Case Dismissed",
        description: "Case dismissed for want of prosecution - petitioner failed to appear",
        causeNumber: "2023-53496",
        significance: "Scott appeared when properly served; petitioner did not"
      },
      {
        date: "2024-07-19",
        type: "fraud",
        title: "False Certificate of Last Known Address Filed",
        description: "Attorney certifies address as 10202 CHALLANGER 7 DR - a decade-old, misspelled address",
        attorney: "Laci Rendon",
        daysAfterService: 104,
        significance: "Filed despite knowing actual address from December 2023 and successful service in April 2024"
      },
      {
        date: "2024-08-20",
        type: "court",
        title: "Default Judgment Entered",
        description: "Court enters default SAPCR judgment based on fraudulent service by posting",
        causeNumber: "2024-17675",
        significance: "Father loses custody without knowledge of proceeding"
      },
      {
        date: "2025-10-16",
        type: "discovery",
        title: "First Notice of Default Judgment",
        description: "Scott learns of default judgment when Elizabeth sends photo of Final Order",
        daysAfterJudgment: 422,
        significance: "14+ months without knowledge of custody order"
      },
      {
        date: "2025-12-19",
        type: "legal",
        title: "Civil Suit Filed Against Attorney",
        description: "Willis v. Rendon filed - Cause No. 2025-95850",
        causeNumber: "2025-95850",
        defendant: "Laci Rendon",
        claims: ["Fraudulent Certificate of Last Known Address", "Professional negligence"],
        significance: "Attorney held accountable for false address certification"
      },
      {
        date: "2026-01-01",
        type: "retaliation",
        title: "Google Account Disabled 2 Minutes After Call to Deputies",
        description: "Google account disabled at 11:46 AM, exactly 2 minutes after calling deputies to request to speak to a supervisor",
        timeline: {
          call: "11:44 AM - Called deputies requesting to speak to supervisor",
          disabled: "11:46 AM - Google account disabled",
          gap: "2 minutes"
        },
        phoneNumber: "713-274-2500",
        callPurpose: "Request to speak to supervisor",
        significance: "Account disabled within 2 minutes of law enforcement call - coordinated retaliation"
      },
      {
        date: "2026-01-11",
        type: "harassment",
        title: "1570 HCSO 0343 HRS 01112026",
        method: "Phone call",
        time: "03:43 HRS",
        securityStatus: {
          OPSEC: "CHECK",
          COMSEC: "CHECK",
          SITWARE: "IMPECCABLE",
          DEFCON: "NONEXISTENT",
          THREATCON: "NONEXISTENT"
        },
        deadMansSwitches: "ACTIVE",
        message: "YOU SEE ME AND I SEE YOU",
        reference: "8192964317"
      },
      {
        date: "2026-01-05",
        type: "attack",
        title: "Forensic Campaign Against Website Detected",
        description: "Coordinated attack campaign against safesapcrtx.org infrastructure begins",
        indicators: [
          "Unusual traffic patterns",
          "Probe attempts on sensitive endpoints",
          "Bot activity from anonymized sources",
          "Cloudflare WARP anonymization detected",
          "Multiple reconnaissance attempts"
        ],
        anonymizationMethods: ["Cloudflare WARP", "VPN services", "Rotating IPs"],
        response: {
          type: "Weird Inquiry",
          reference: "HCSO15701112026034317137665853",
          answer: "SENTFJ9TT1RIPQ==",
          immutableAuditTrail: {
            location: "Harris County District Clerk UI",
            dataType: "Address Data",
            status: "Preserved",
            note: "All address discrepancies permanently logged in court system"
          }
        },
        significance: "Apparent retaliation for public exposure of fraud - attackers using anonymization to hide identity"
      },
      {
        date: "2026-01-05",
        type: "countermeasures",
        title: "Cloudflare WARP Pen Meeting - Stonewall Same Day as Citation Served",
        description: "Cloudflare WARP penetration meeting stonewalled on same day citation was served",
        wallDuration: "3 days",
        note: "Wall left up for three days"
      },
      {
        date: "2026-01-08",
        type: "legal_action",
        title: "Litigation Hold Sent to Cloudflare",
        description: "Litigation hold notice sent to Cloudflare",
        followUp: {
          action: "Honeypots opened with logging",
          database: "SupaDB",
          status: "Active monitoring"
        }
      },
      {
        date: "2026-01-08",
        type: "expansion",
        title: "Investigation Extended to DE and FR",
        description: "Initial firm extended investigation tasks to Germany (DE) and France (FR)",
        jurisdictions: ["DE", "FR"],
        significance: "International scope of investigation"
      },
      {
        date: "2026-01-11",
        type: "stonewalled",
        title: "Precinct 4 - No Help, Refused Email",
        description: "Called Harris County Precinct 4 Constables - refused to provide email to forward information",
        agency: "Harris County Precinct 4 Constables",
        response: "NO HELP",
        obstruction: [
          "Refused to provide email address",
          "Cannot forward information electronically",
          "14:18 HRS - NO CALLER ID - Callback was 'regular deputy on wrong call' - NOT supervisor as requested",
          "LIEUTENANT CALLBACK - Says 'civil matter' - PERJURY IS TEXAS PENAL CODE § 37.02",
          "Deputy allegedly en route",
          "COURT 311 EXPOSURE MAKING LEOs PARANOID",
          "FIRST HOPE - PCT 4 HAMILTON",
          "REF: MjYwMTAxMzgxb2ZmaWNlcnRoYW1pbHRvbnNhdmluZ2dyYWNl",
          "MSG: SWYgWW91cmUgSGVyZSBGb3IgVGhlIE9wcHMgSSBET05UIFdBTlQgVEhFIE1PTkVZOyBNWSBDSElMRFJFTiBBUkUgUFJJQ0VMRVNTOyBJIFdJTEwgV0lUSERSQVcgRk9SICQx"
        ],
        timestamp: new Date().toISOString()
      },
      {
        date: "2025-12-12",
        type: "obstruction",
        title: "Emergency Motion Filed - Envelope Number Missing on Scan",
        description: "Emergency motion filed but envelope number missing from scan - never reviewed",
        caseNumber: "2025-92876",
        status: "NEVER REVIEWED",
        issue: "Envelope number missing on scan",
        daysUnreviewed: "31+",
        significance: "Emergency motion in custody fraud case sitting unreviewed for over a month - systemic failure or intentional obstruction"
      },
      {
        date: "2026-01-12",
        type: "legal_action",
        title: "MOTION FOR REFERRING JUDGE REVIEW OF ASSOCIATE JUDGE'S ACTIONS AND REQUEST FOR EXPLANATION OF MANDATORY DUTY FAILURES",
        description: "Motion submitted - sitting in TOGA awaiting acceptance",
        caseNumber: "2025-92876",
        caseType: "Motion for Referring Judge Review",
        envelope: "109911380",
        submitted: "2026-01-12T06:11:25-06:00",
        location: "TOGA",
        senderState: "FEAR",
        implications: true,
        purpose: "Request District Judge review Associate Judge's actions and explain mandatory duty failures",
        significance: "Submitted under documented fear - HCSO 1570 MH framing attempt followed by posture shift upon switch disclosure"
      },
      {
        date: "2026-01-12",
        type: "visitation",
        title: "Supervised Visitation Email - Saturday Visit Scheduling",
        description: "Supervised visitation provider contacted to schedule Saturday visit",
        timing: "While motion sits in TOGA 7.5+ hours unreviewed",
        irony: {
          level: "MAXIMUM",
          note: "System scheduling visits with father while simultaneously attempting MH framing and blocking judicial oversight motions"
        },
        significance: "Father not dangerous enough to block visits - but 'mentally ill' enough to discredit his fraud claims?"
      },
      {
        date: "2026-01-12",
        type: "retaliation",
        title: "HCSO 1570 Attempted MH Narrative Framing",
        description: "Harris County Sheriff's Office 1570 made attempts to frame narrative as mental health issue",
        agency: "HCSO",
        unit: "1570",
        tactic: "MH_FRAMING",
        tactics_used: [
          "Attempted to reframe legitimate legal claims as mental health issue",
          "Classic discrediting tactic against whistleblowers",
          "Documented pattern of obstruction"
        ],
        response: {
          evidence: "Immutable audit trail",
          documentation: "All claims backed by court records, hotel folios, Cash App receipts",
          website: "safesapcrtx.org - public record",
          api: "Machine-readable evidence at /api/evidence"
        },
        significance: "Attempted institutional gaslighting - evidence speaks for itself"
      },
      {
        date: "2026-01-12",
        type: "shift",
        title: "System Posture Shifted Upon Switch Disclosure",
        description: "Institutional posture changed after dead man's switch / envelope implications disclosed",
        sequence: [
          "1. HCSO 1570 attempted MH narrative framing",
          "2. Dead man's switch disclosed",
          "3. System posture shifted"
        ],
        interpretation: {
          before: "MH framing attempt - discredit the witness",
          trigger: "Disclosure of dead man's switch / envelope 109911380 with implications",
          after: "Posture shift - recognition that documentation exists"
        },
        implication: "Behavioral change upon learning of accountability mechanisms suggests awareness of wrongdoing",
        significance: "Consciousness of guilt indicator - posture only shifts when exposure is credible"
      }
    ]
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(timeline, null, 2)
  };
};
