// GET /api/evidence - Document metadata and evidence catalog
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300'
  };

  const evidence = {
    lastUpdated: "2026-01-11",

    categories: {
      hotelRecords: {
        description: "Hotel folios proving 4-guest stays during alleged 'disappearance'",
        documents: [
          {
            id: "WILLIS_79242",
            type: "Hotel Folio",
            hotel: "TownePlace Suites Baytown",
            dates: "June 16-19, 2023",
            guests: 4,
            path: "/documents/WILLIS_79242.pdf",
            significance: "Proves mother was present during alleged disappearance"
          },
          {
            id: "WILLIS_79490",
            type: "Hotel Folio",
            hotel: "TownePlace Suites Baytown",
            dates: "June 30 - July 2, 2023",
            guests: 4,
            path: "/documents/WILLIS_79490.pdf",
            significance: "Same hotel where ambush later occurred"
          },
          {
            id: "WILLIS_79654",
            type: "Hotel Folio",
            hotel: "TownePlace Suites Baytown",
            dates: "July 2-3, 2023",
            path: "/documents/WILLIS_79654.pdf"
          },
          {
            id: "WILLIS_74641",
            type: "Hotel Folio",
            hotel: "TownePlace Suites I-10 East Houston",
            dates: "Sept 27 - Oct 1, 2023",
            guests: 4,
            path: "/documents/WILLIS_74641.pdf",
            significance: "Extended stay with full family"
          },
          {
            id: "GST_646035",
            type: "Hotel Folio",
            hotel: "Aloft New Orleans",
            dates: "July 14-16, 2023",
            guests: 4,
            path: "/documents/359716Folio-GST_646035.pdf",
            significance: "Family vacation in New Orleans"
          },
          {
            id: "GST_705140",
            type: "Hotel Folio",
            hotel: "Aloft New Orleans",
            dates: "Aug 19-20, 2023",
            path: "/documents/363654Folio-GST_705140.pdf"
          }
        ]
      },

      financialRecords: {
        description: "Cash App transactions proving ongoing contact and coordination",
        documents: [
          {
            id: "CashApp_01",
            type: "Cash App Screenshot",
            period: "Jan 2024 / Dec 2023",
            path: "/documents/hungry-evidence/CashApp_01_Jan2024_Dec2023.png"
          },
          {
            id: "CashApp_02",
            type: "Cash App Screenshot",
            period: "November 2023",
            path: "/documents/hungry-evidence/CashApp_02_Nov2023.png",
            significance: "Contains $250 payment 'to see my babies'"
          },
          {
            id: "CashApp_03",
            type: "Cash App Screenshot",
            period: "September 2023",
            path: "/documents/hungry-evidence/CashApp_03_Sep2023.png"
          },
          {
            id: "CashApp_04",
            type: "Cash App Screenshot",
            period: "May / April 2023",
            path: "/documents/hungry-evidence/CashApp_04_May_Apr2023.png"
          },
          {
            id: "CashApp_05",
            type: "Cash App Screenshot",
            period: "April / March 2023",
            path: "/documents/hungry-evidence/CashApp_05_Apr_Mar2023.png"
          },
          {
            id: "CashApp_06",
            type: "Cash App Screenshot",
            period: "Sept / Aug 2023",
            path: "/documents/hungry-evidence/CashApp_06_Sep_Aug2023.png"
          },
          {
            id: "CashApp_07",
            type: "Cash App Screenshot",
            period: "July / June 2023",
            path: "/documents/hungry-evidence/CashApp_07_Jul_Jun2023.png"
          }
        ],
        summary: {
          totalTransactions: "50+",
          keyTransaction: "$250 'to see my babies' - November 2023"
        }
      },

      courtRecords: {
        description: "Public court filings and records",
        cases: [
          {
            causeNumber: "2024-17675",
            type: "SAPCR",
            keyDocuments: ["Original Petition", "Sworn Affidavit", "Certificate of Last Known Address", "Default Judgment"]
          },
          {
            causeNumber: "2023-53496",
            type: "Habeas Corpus",
            keyDocuments: ["Motion for Service - lists New Orleans address"],
            significance: "Proves petitioner knew correct address in December 2023"
          },
          {
            causeNumber: "1918-53401010",
            type: "Prior Case (2013)",
            keyDocuments: ["Original filing with misspelled address"],
            significance: "Same misspelled address used in 2024 certificate"
          }
        ]
      }
    },

    fraudDocumentation: {
      certificateOfLastKnownAddress: {
        filed: "2024-07-19",
        filedBy: "Laci Rendon",
        certifiedAddress: "10202 CHALLANGER 7 DR, 604, JACINTO CI, TX 77029",
        misspellings: ["CHALLANGER should be CHALLENGER", "JACINTO CI should be JACINTO CITY"],
        lastValidDate: "2013-12-31",
        yearsOutdated: 10,
        knownCorrectAddress: {
          address: "8918 Heaton St., New Orleans, LA 70118",
          dateKnown: "2023-12-27",
          source: "Habeas Corpus filing Cause No. 2023-53496"
        },
        priorSuccessfulService: {
          date: "2024-04-06",
          location: "Harris County",
          daysBeforeFalseCertificate: 104
        }
      }
    },

    api: {
      note: "Document paths are relative to https://safesapcrtx.org",
      accessibleDocuments: "PDF files and images available at listed paths"
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(evidence, null, 2)
  };
};
