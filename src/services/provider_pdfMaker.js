const fs = require("fs");
const path = require("path");
const PCP = require("../schemas/primarycare.provider.schema");

const {
  PDFDocument,
  StandardFonts,
  rgb,
} = require("pdf-lib");


const CONFIG = {
  templatePath: path.join(
    "src",
    "templates",
    "MCP_2027_Provider_Directory_Alphabetical_with_Introduction.pdf"
  ),

  individualsPath: path.join(
    "src",
    "jsonfiles",
    "provider_directory.json"
  ),

  facilitiesPath: path.join(
    "src",
    "jsonfiles",
    "facility.json"
  ),

  outputPath: path.join(
    "src",
    "output",
    "MCP_2027_Provider_Directory_with_Introduction.pdf"
  ),

  // Zero-based index of the template page
  // containing the provider directory layout.
  //
  // PDF page 4 = index 3
  SAMPLE_PAGE_INDEX: 3,

  PAGE_WIDTH: 612,
  PAGE_HEIGHT: 792,

  LEFT_MARGIN: 30.24,
  RIGHT_MARGIN: 30.24,

  COLUMN_GAP: 15,
  COLUMN_COUNT: 3,

  CONTENT_TOP: 675,
  CONTENT_BOTTOM: 55,

  SECTION_HEADING_SIZE: 20,

  LOCATION_HEADING_SIZE: 9.2,

  NAME_SIZE: 9.2,

  DETAIL_SIZE: 8.4,

  DETAIL_LINE_GAP: 2.2,

  ENTRY_BOTTOM_GAP: 8,

  SEPARATOR_WIDTH: 0.5,

  COVER_BODY_FROM_Y: 42,
  COVER_BODY_TO_Y: 700,

  FOOTER_TEXT:
    "MCP 2027 Provider Directory - Harris County",

  FOOTER_SIZE: 7.5,

  SECTION_COLOR: rgb(
    0.08,
    0.20,
    0.36
  ),

  FOOTER_COLOR: rgb(
    0.45,
    0.45,
    0.45
  ),

  BLACK: rgb(
    0,
    0,
    0
  ),

  LIGHT_LINE: rgb(
    0.82,
    0.82,
    0.82
  ),
};

// ============================================================
// PROVIDER CONFIGURATION
// ============================================================

const PROVIDER_CONFIG = {
  YEAR: "2027",

  // ==========================================================
  // SPECIALTY MAP
  // ==========================================================

  SPECIALTY_MAP: {
    "207Q00000X":
      "Family Medicine",

    "208600000X":
      "General Surgery",

    "208G00000X":
      "Cardiothoracic Surgery",

    "363L00000X":
      "Nurse Practitioner",

    "163WW0000X":
      "Wound Care",

    "207RR0500X":
      "Rheumatology",

    "207X00000X":
      "Orthopedic Surgery",

    "207RN0300X":
      "Nephrology",

    "207R00000X":
      "Internal Medicine",

    "213E00000X":
      "Podiatry",

    "2084N0400X":
      "Neurology",

    "2086S0122X":
      "Plastic Surgery",

    "207RI0200X":
      "Infectious Diseases",

    "207RC0000X":
      "Cardiology",

    "207RX0202X":
      "Oncology",

    "225100000X":
      "Physical Therapy",

    "207RP1001X":
      "Pulmonary Diseases",

    "208VP0000X":
      "Pain Management",

    "363LF0000X":
      "Family Nurse Practitioner",

    "2086S0129X":
      "Vascular Surgery",

    "208800000X":
      "Urology",

    "208C00000X":
      "Colon & Rectal Surgery",

    "207V00000X":
      "Obstetrics & Gynecology",

    "133V00000X":
      "Registered Dietitian",

    "363LA2100X":
      "Acute Care Nurse Practitioner",

    "2085R0204X":
      "Interventional Radiology",

    "207RG0100X":
      "Gastroenterology",

    "2080P0205X":
      "Endocrinology",

    "207K00000X":
      "Allergy & Immunology",

    "2085R0001X":
      "Radiation Oncology",

    "363LP0808X":
      "Psychiatric/Mental Health Nurse Practitioner",

    "207T00000X":
      "Neurosurgery",

    "2084P0800X":
      "Psychiatry",

    "152W00000X":
      "Optometry",

    "101YM0800X":
      "Mental Health Counselor",

    "367A00000X":
      "Advanced Practice Midwife",

    "101Y00000X":
      "Counselor",

    "1041C0700X":
      "Clinical Social Worker",

    "207W00000X":
      "Ophthalmology",

    "207Y00000X":
      "Otolaryngology",

    "207N00000X":
      "Dermatology",

    "207ND0900X":
      "Dermapathology",

    "122300000X":
      "Dentistry",

    "207RC0200X":
      "Pulmonary & Critical Care",

    "2080P0214X":
      "Pediatric Pulmonology",

    "207RH0000X":
      "Hematology",

    "207RH0003X":
      "Hematology & Oncology",

    "207VX0201X":
      "Gynecologic Oncology",

    "363A00000X":
      "Physician Assistant",

    "208100000X":
      "Physical Medicine and Rehabilitation",

    "2086X0206X":
      "Surgical Oncology",

    "207RC0001X":
      "Cardiac Electrophysiology",

    "2080P0202X":
      "Pediatric Cardiology",

    "111N00000X":
      "Chiropractic",

    "103TC0700X":
      "Clinical Psychologist",

    "207P00000X":
      "Emergency Medicine",

    "208D00000X":
      "General Practice",

    "207RI0011X":
      "Interventional Cardiology",

    "2084B0040X":
      "Neuropsychiatry",

    "225X00000X":
      "Occupational Therapist",

    "208000000X":
      "Pediatrics",

    "2083P0901X":
      "Preventive Medicine",

    "207RS0012X":
      "Sleep Medicine",

    "235Z00000X":
      "Speech Pathology",

    "106H00000X":
      "Marriage & Family Therapist",

    "101YP2500X":
      "Counselor",

    "103TC1900X":
      "Counseling Psychologist",

    "103T00000X":
      "Psychologist",

    "170300000X":
      "Certified Genetic Counselor",

    "251G00000X":
      "Hospice and Palliative Medicine",

    "363LA2200X":
      "Adult Nurse Practitioner",

    "363LG0600X":
      "Adult-Gerontology Acute Care Nurse Practitioner",

    "207L00000X":
      "Anesthesiology",

    "207LC0200X":
      "Critical Care Medicine",

    "207WX0107X":
      "Retinal Ophthalmology",

    "207XX0005X":
      "Orthopaedic Sports Medicine",

    "2085R0202X":
      "Diagnostic Radiology",

    "207RE0101X":
      "Endocrinology",

    "213ES0103X":
      "Foot & Ankle Surgery",
  },

  // ==========================================================
  // FACILITY SPECIALTY MAP
  // ==========================================================

  FACILITY_SPECIALTY_MAP: {
    "040":
      "Acute Inpatient Services",

    "041":
      "Cardiac Surgery Program",

    "042":
      "Cardiac Catheterization Services",

    "043":
      "Critical Care Services - Intensive Care Units (ICU)",

    "045":
      "Surgical Services (Outpatient or ASC)",

    "046":
      "Skilled Nursing Facility",

    "047":
      "Diagnostic Radiology",

    "048":
      "Mammography",

    "049":
      "Physical Therapy",

    "050":
      "Occupational Therapy",

    "051":
      "Speech Therapy",

    "055":
      "Home Health",
  },
};

// ============================================================
// INTRODUCTION PAGE 1
// ============================================================

const INTRO_PAGE_1 = [
  {
    text:
      "MedCare Partners Health Plan of Texas",

    size: 21,

    bold: true,

    center: true,

    gap: 8,
  },

  {
    text:
      "HMO Plan",

    size: 15,

    bold: true,

    center: true,

    gap: 5,
  },

  {
    text:
      "Provider Directory",

    size: 18,

    bold: true,

    center: true,

    gap: 18,
  },

  {
    text:
      "This directory is current as of October 1, 2026.",

    size: 9.5,

    gap: 10,
  },

  {
    text:
      "This directory provides a list of MedCare Partners Health Plan of Texas’ current network providers for MedCare Classic (HMO), MedCare Focus (HMO C-SNP), and MedCare Choice (HMO C-SNP) in Harris County, Texas.",

    size: 9.5,

    gap: 10,
  },

  {
    text:
      "To access MedCare Partners Health Plan of Texas’ online provider directory, you can visit www.mcpartnerstx.com/. For any questions about the information contained in this directory, please call our Member Services Department at 1-833-MCP-TX24 (1-833-627-8924), 8:00 am-8:00 pm seven days a week (except Thanksgiving and Christmas) from October 1 to March 31 and 8:00 am-8:00 pm, Monday through Friday (except holidays) from April 1 through September 30. TTY users should call TTY number 711.",

    size: 9.5,

    gap: 10,
  },

  {
    text:
      "If you request it, your request for hard copies of the provider directory remains until you leave MedCare Partners Health Plan of Texas or request that hard copies be discontinued.",

    size: 9.5,

    gap: 10,
  },

  {
    text:
      "You can get this information for free in other formats, such as large print, braille, or audio. Call our toll-free number at 1-833-MCP-TX24 (1-833-627-8924). TTY users should call 711.",

    size: 9.5,

    gap: 10,
  },

  {
    text:
      "This document is available for free in English, Spanish, and Vietnamese.",

    size: 9.5,

    gap: 10,
  },

  {
    text:
      "Your request for the provider directory in an accessible format will be applied on a standing basis unless you request otherwise.",

    size: 9.5,

    gap: 14,
  },

  {
    text:
      "H5767_ProvDir_C",

    size: 8.5,

    bold: true,

    gap: 5,
  },
];

// ============================================================
// INTRODUCTION PAGE 2
// ============================================================

const INTRO_PAGE_2 = [
  {
    text:
      "Introduction",

    size: 15,

    bold: true,

    gap: 14,
  },

  {
    text:
      "This directory provides a list of MedCare Partners Health Plan of Texas’ network providers.",

    size: 9.2,

    gap: 9,
  },

  {
    text:
      "You will have to choose one of our network providers listed in this directory to be your Primary Care Provider (PCP). Generally, you must get your health care services from your PCP. There are several types of providers that may serve as your PCP, and these include: Family Practice, General Practice, and Internal Medicine. The term “PCP” will be used throughout this directory.",

    size: 9.2,

    gap: 9,
  },

  {
    text:
      "The network providers listed in this directory have agreed to provide you with your health care services. You may go to any of our network providers listed in this directory; however, some services may require a referral. For services requiring a referral, your PCP will provide the referral when needed. Your care is directed by your PCP, and they may not admit to all network hospitals or skilled nursing facilities, or they may not refer to all network providers. Before you receive any services, always check whether your doctors, facilities, and providers are in-network with MedCare Partners Health Plan of Texas. If you want to use a specific hospital, skilled nursing facility, or provider, call our Member Services to confirm that your doctor is in the network.",

    size: 9.2,

    gap: 9,
  },

  {
    text:
      "If you choose to use providers who are not in MedCare Partners Health Plan of Texas’ network, you may incur higher costs. In some cases, you might receive a bill from a non-plan provider for the entire amount of your medical care. Do not pay this bill. Instead, please send us the bill along with any proof of payment you have made, and we will review it for determination.",

    size: 9.2,

    gap: 9,
  },

  {
    text:
      "Mail your request for payment, along with the bills and receipts, to:",

    size: 9.2,

    gap: 6,
  },

  {
    text:
      "MedCare Partners Health Plan of Texas\n11602 Bellaire Blvd\nSuite C/D\nHouston, TX 77072",

    size: 9.2,

    gap: 9,
  },

  {
    text:
      "If we decide that your medical care is not covered or that you did not follow the required plan rules, we will deny payment and send you a letter explaining our decision and your rights to appeal.",

    size: 9.2,

    gap: 9,
  },

  {
    text:
      "You must use network providers except in emergency or urgent care situations or for out-of-area renal dialysis or other services. If you obtain routine care from out-of-network providers, neither Medicare nor MedCare Partners Health Plan of Texas will be responsible for the costs.",

    size: 9.2,

    gap: 12,
  },

  {
    text:
      "What is the service area for MedCare Partners Health Plan of Texas?",

    size: 11,

    bold: true,

    gap: 6,
  },

  {
    text:
      "The county in our service area is listed below.",

    size: 9.2,

    gap: 5,
  },

  {
    text:
      "Harris County",

    size: 9.2,

    bold: true,

    gap: 10,
  },

  {
    text:
      "How do you find MedCare Partners Health Plan of Texas providers that serve your area?",

    size: 11,

    bold: true,

    gap: 6,
  },

  {
    text:
      "You can use this Provider Directory to find and choose a Primary Care Physician (PCP). PCPs are listed alphabetically by last name, organized by County and City. MedCare Partners Health Plan of Texas has included their areas of practice, such as Family Practice, General Practice, or Internal Medicine.",

    size: 9.2,

    gap: 9,
  },

  {
    text:
      "If you have questions about MedCare Partners Health Plan of Texas or require assistance in selecting a PCP, please call our Member Services Department at 1-833-MCP-TX24 (1-833-627-8924) from 8:00 am to 8:00 pm, seven days a week (except Thanksgiving and Christmas) from October 1 to March 31. From April 1 to September 30, we are open Monday to Friday (excluding holidays). TTY users can call 711. You can also visit www.mcpartnerstx.com/.",

    size: 9.2,

    gap: 8,
  },
];

// ============================================================
// BASIC HELPERS
// ============================================================

function assertFileExists(
  filePath,
  label
) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `${label} not found:\n${filePath}`
    );
  }
}

function readJson(
  filePath
) {
  assertFileExists(
    filePath,
    "JSON file"
  );

  const raw =
    fs.readFileSync(
      filePath,
      "utf8"
    );

  if (!raw.trim()) {
    return [];
  }

  let data;

  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${filePath}: ${error.message}`
    );
  }

  if (Array.isArray(data)) {
    return data;
  }

  const keys = [
    "providers",
    "provider",
    "facilities",
    "facility",
    "data",
    "results",
    "items",
  ];

  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  const firstArray =
    Object.values(data).find(
      Array.isArray
    );

  return firstArray || [];
}

function clean(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .replace(
      /\r?\n/g,
      " "
    )
    .replace(
      /[\u2018\u2019]/g,
      "'"
    )
    .replace(
      /[\u201C\u201D]/g,
      '"'
    )
    .replace(
      /[\u2013\u2014]/g,
      "-"
    )
    .replace(
      /\u2026/g,
      "..."
    )
    .replace(
      /\u00A0/g,
      " "
    )
    .replace(
      /[^\x20-\x7E\xA0-\xFF]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function pick(
  obj,
  keys,
  fallback = ""
) {
  if (!obj) {
    return fallback;
  }

  for (const key of keys) {
    const value =
      obj[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return fallback;
}

function uniqueStrings(
  values
) {
  return [
    ...new Set(
      (values || [])
        .map(clean)
        .filter(Boolean)
    ),
  ];
}

function formatPhone(
  value
) {
  const phone =
    clean(value);

  if (!phone) {
    return "";
  }

  const digits =
    phone.replace(
      /\D/g,
      ""
    );

  if (
    digits.length === 10
  ) {
    return `(${digits.slice(
      0,
      3
    )}) ${digits.slice(
      3,
      6
    )}-${digits.slice(6)}`;
  }

  if (
    digits.length === 11 &&
    digits.startsWith("1")
  ) {
    return `(${digits.slice(
      1,
      4
    )}) ${digits.slice(
      4,
      7
    )}-${digits.slice(7)}`;
  }

  return phone;
}

function normalizeNpi(
  value
) {
  return clean(value).replace(
    /\D/g,
    ""
  );
}

function normalizeAccepting(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  const normalized =
    clean(value).toLowerCase();

  if (
    [
      "yes",
      "true",
      "y",
      "1",
      "accepting",
      "open",
    ].includes(
      normalized
    )
  ) {
    return "Yes";
  }

  if (
    [
      "no",
      "false",
      "n",
      "0",
      "not accepting",
      "closed",
    ].includes(
      normalized
    )
  ) {
    return "No";
  }

  return clean(value);
}

// ============================================================
// MONGODB PCP SOURCE
// ============================================================

async function getPCPsFromMongoDB() {
  if (
    !PCP ||
    typeof PCP.find !== "function"
  ) {
    throw new Error(
      `MongoDB model "${PCP_MODEL_NAME}" is not available.`
    );
  }

  const rows =await PCP.find({}).lean().exec();

  console.log(
    `PCP database rows: ${rows.length}`
  );
  

  return rows;
}

// ============================================================
// ADDRESS NORMALIZATION
// ============================================================

function normalizeAddress(
  rawAddress
) {
  if (
    !rawAddress ||
    typeof rawAddress !==
      "object"
  ) {
    return null;
  }

  const address = {
    address:
      clean(
        pick(
          rawAddress,
          [
            "address",
            "Address",
            "street",
            "Street",
            "streetAddress",
            "StreetAddress",
            "addressLine1",
            "AddressLine1",
            "Address Line 1",
            "address1",
            "Address1",
            "line1",
          ]
        )
      ),

    address2:
      clean(
        pick(
          rawAddress,
          [
            "address2",
            "Address2",
            "address_2",
            "Address Line 2",
            "Adress Line 2",
            "addressLine2",
            "AddressLine2",
            "line2",
            "suite",
            "Suite",
            "unit",
            "Unit",
          ]
        )
      ),

    city:
      clean(
        pick(
          rawAddress,
          [
            "city",
            "City",
          ]
        )
      ),

    state:
      clean(
        pick(
          rawAddress,
          [
            "state",
            "State",
            "stateCode",
            "StateCode",
          ]
        )
      ),

    county:
      clean(
        pick(
          rawAddress,
          [
            "county",
            "County",
            "countyName",
            "CountyName",
          ]
        )
      ),

    zip:
      clean(
        pick(
          rawAddress,
          [
            "zip",
            "Zip",
            "ZIP",
            "zipCode",
            "ZipCode",
            "Zip Code",
            "postalCode",
            "PostalCode",
          ]
        )
      ),

    phone:
      formatPhone(
        pick(
          rawAddress,
          [
            "phone",
            "Phone",
            "phoneNumber",
            "PhoneNumber",
            "Phone Number",
            "telephone",
            "Telephone",
            "primaryPhone",
            "PrimaryPhone",
          ]
        )
      ),
  };

  if (
    ![
      address.address,
      address.address2,
      address.city,
      address.state,
      address.county,
      address.zip,
      address.phone,
    ].some(Boolean)
  ) {
    return null;
  }

  return address;
}

function collectRawAddresses(
  provider
) {
  const addresses = [];

  // ----------------------------------------------------------
  // Direct addresses array
  // ----------------------------------------------------------

  const directAddresses =
    [
      provider.addresses,
      provider.Addresses,
      provider.locations,
      provider.Locations,
      provider.practices,
      provider.Practices,
    ];

  for (
    const collection of
      directAddresses
  ) {
    if (
      Array.isArray(
        collection
      )
    ) {
      addresses.push(
        ...collection
      );
    }
  }

  // ----------------------------------------------------------
  // Nested provider locations
  // ----------------------------------------------------------

  if (
    provider.location &&
    typeof provider.location ===
      "object"
  ) {
    addresses.push(
      provider.location
    );
  }

  if (
    provider.Location &&
    typeof provider.Location ===
      "object"
  ) {
    addresses.push(
      provider.Location
    );
  }

  // ----------------------------------------------------------
  // Flat MongoDB document
  // ----------------------------------------------------------

  addresses.push(
    provider
  );

  return addresses;
}

function dedupeAddresses(
  addresses
) {
  const map =
    new Map();

  for (
    const rawAddress of
      addresses || []
  ) {
    const address =
      normalizeAddress(
        rawAddress
      );

    if (!address) {
      continue;
    }

    const key = [
      address.address,
      address.address2,
      address.city,
      address.state,
      address.county,
      address.zip,
    ]
      .map(
        (value) =>
          clean(value)
            .toLowerCase()
      )
      .join("|");

    if (
      !map.has(key)
    ) {
      map.set(
        key,
        address
      );
    } else {
      const existing =
        map.get(key);

      if (
        !existing.phone &&
        address.phone
      ) {
        existing.phone =
          address.phone;
      }

      if (
        !existing.county &&
        address.county
      ) {
        existing.county =
          address.county;
      }
    }
  }

  return [
    ...map.values(),
  ];
}

// ============================================================
// PCP NORMALIZATION FROM MONGODB
// ============================================================

function normalizeMongoPCP(
  row
) {
  if (!row) {
    return null;
  }

  const npi =
    normalizeNpi(
      pick(
        row,
        [
          "NPI",
          "npi",
          "Npi",
        ]
      )
    );

  const firstName =
    clean(
      pick(
        row,
        [
          "First Name",
          "FirstName",
          "firstName",
          "first_name",
          "firstname",
        ]
      )
    );

  const lastName =
    clean(
      pick(
        row,
        [
          "Last Name",
          "LastName",
          "lastName",
          "last_name",
          "lastname",
        ]
      )
    );

  const entityName =
    clean(
      pick(
        row,
        [
          "Provider_Entity_Name",
          "Provider Entity Name",
          "providerEntityName",
          "ProviderEntityName",
          "entityName",
          "providerName",
          "ProviderName",
          "name",
          "Name",
        ]
      )
    );

  const providerName =
    entityName ||
    [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ");

  const addresses =
    dedupeAddresses(
      collectRawAddresses(
        row
      )
    );

  const accepting =
    normalizeAccepting(
      pick(
        row,
        [
          "Accepting New Patients",
          "AcceptingNewPatients",
          "acceptingNewPatients",
          "accepting_new_patients",
          "accepting",
          "Accepting",
        ]
      )
    );

  const languages =
    uniqueStrings(
      [
        pick(
          row,
          [
            "languages",
            "Languages",
            "language",
            "Language",
            "Cultural/Linguistic Capabilities",
            "Cultural Linguistic Capabilities",
            "culturalLinguisticCapabilities",
          ]
        ),
      ]
    );

  const provider = {
    npi,

    type:
      "Individual",

    name:
      providerName,

    firstName,

    lastName,

    degree:
      clean(
        pick(
          row,
          [
            "Degree",
            "degree",
          ]
        )
      ),

    providerEntityName:
      entityName,

    providerTin:
      clean(
        pick(
          row,
          [
            "Provider_TIN",
            "Provider TIN",
            "ProviderTIN",
            "providerTin",
            "provider_tin",
          ]
        )
      ),

    providerId:
      clean(
        pick(
          row,
          [
            "Provider_ID",
            "Provider ID",
            "ProviderId",
            "providerId",
            "provider_id",
          ]
        )
      ),

    practiceId:
      clean(
        pick(
          row,
          [
            "Practice_ID",
            "Practice ID",
            "PracticeId",
            "practiceId",
            "practice_id",
          ]
        )
      ),

    locationId:
      clean(
        pick(
          row,
          [
            "Location_ID",
            "Location ID",
            "LocationId",
            "locationId",
            "location_id",
          ]
        )
      ),

    languages,

    accepting,

    specialties: [
      "Primary Care",
    ],

    specialtyCodes: [],

    addresses,

    directoryType:
      "Primary Care Providers (PCPs)",
  };

  if (
    !provider.name &&
    !provider.npi &&
    !provider.addresses.length
  ) {
    return null;
  }

  return provider;
}

// ============================================================
// BUILD UNIQUE PCPs
// ============================================================

function buildPCPsFromMongoRows(
  rows
) {
  const providers =
    new Map();

  for (
    const row of rows
  ) {
    const normalized =
      normalizeMongoPCP(
        row
      );

    if (!normalized) {
      continue;
    }

    /*
     * NPI is the primary identity.
     *
     * If NPI is missing, use Provider_ID.
     * If that is also missing, use Mongo _id.
     */

    const fallbackId =
      clean(
        pick(
          row,
          [
            "Provider_ID",
            "ProviderId",
            "providerId",
            "_id",
          ]
        )
      );

    const providerKey =
      normalized.npi ||
      fallbackId;

    if (!providerKey) {
      continue;
    }

    if (
      !providers.has(
        providerKey
      )
    ) {
      providers.set(
        providerKey,
        normalized
      );

      continue;
    }

    const existing =
      providers.get(
        providerKey
      );

    /*
     * Merge missing provider fields.
     */

    existing.name =
      existing.name ||
      normalized.name;

    existing.firstName =
      existing.firstName ||
      normalized.firstName;

    existing.lastName =
      existing.lastName ||
      normalized.lastName;

    existing.degree =
      existing.degree ||
      normalized.degree;

    existing.providerEntityName =
      existing.providerEntityName ||
      normalized.providerEntityName;

    existing.providerTin =
      existing.providerTin ||
      normalized.providerTin;

    existing.providerId =
      existing.providerId ||
      normalized.providerId;

    existing.practiceId =
      existing.practiceId ||
      normalized.practiceId;

    existing.locationId =
      existing.locationId ||
      normalized.locationId;

    existing.accepting =
      existing.accepting ||
      normalized.accepting;

    existing.languages =
      uniqueStrings([
        ...(existing.languages ||
          []),

        ...(normalized.languages ||
          []),
      ]);

    existing.addresses =
      dedupeAddresses([
        ...(existing.addresses ||
          []),

        ...(normalized.addresses ||
          []),
      ]);
  }

  const result =
    [
      ...providers.values(),
    ];

  console.log(
    `Unique PCPs from MongoDB: ${result.length}`
  );

  return result;
}

// ============================================================
// SPECIALIST NORMALIZATION
// ============================================================

function getPlanYears(
  plan
) {
  if (!plan) {
    return [];
  }

  if (
    Array.isArray(
      plan.year
    )
  ) {
    return uniqueStrings(
      plan.year
    );
  }

  if (
    plan.year !==
      undefined &&
    plan.year !== null
  ) {
    return [
      clean(
        plan.year
      ),
    ];
  }

  if (
    plan.Year !==
      undefined &&
    plan.Year !== null
  ) {
    return [
      clean(
        plan.Year
      ),
    ];
  }

  return [];
}

function normalizeIndividual(
  provider
) {
  if (
    !provider ||
    clean(
      provider.type
    ).toLowerCase() !==
      "individual"
  ) {
    return null;
  }

  const name =
    provider.name || {};

  const fullName =
    [
      name.prefix,
      name.first,
      name.middle,
      name.last,
      name.suffix,
    ]
      .map(clean)
      .filter(Boolean)
      .join(" ");

  const plans =
    Array.isArray(
      provider.plans
    )
      ? provider.plans
      : [];

  const yearPlans =
    plans.length
      ? plans.filter(
          (plan) =>
            getPlanYears(
              plan
            ).includes(
              PROVIDER_CONFIG.YEAR
            )
        )
      : [];

  /*
   * If the JSON provider has plans,
   * only 2027 plans are used.
   *
   * If no plans exist, keep the provider.
   */

  if (
    plans.length &&
    !yearPlans.length
  ) {
    return null;
  }

  const usablePlans =
    yearPlans.length
      ? yearPlans
      : plans;

  const specialtyCodes =
    uniqueStrings(
      usablePlans.flatMap(
        (plan) =>
          Array.isArray(
            plan.specialty
          )
            ? plan.specialty
            : []
      )
    );

  const specialties =
    uniqueStrings(
      specialtyCodes.map(
        (code) =>
          PROVIDER_CONFIG
            .SPECIALTY_MAP[
            code
          ] ||
          "Other Specialty"
      )
    );

  const accepting =
    uniqueStrings(
      usablePlans.map(
        (plan) =>
          normalizeAccepting(
            plan.accepting
          )
      )
    ).join(", ");

  const addresses =
    [];

  for (
    const plan of
      usablePlans
  ) {
    if (
      Array.isArray(
        plan.addresses
      )
    ) {
      addresses.push(
        ...plan.addresses
      );
    }
  }

  if (
    Array.isArray(
      provider.addresses
    )
  ) {
    addresses.push(
      ...provider.addresses
    );
  }

  const normalized =
    {
      npi:
        normalizeNpi(
          provider.npi
        ),

      type:
        "Individual",

      name:
        fullName ||
        clean(
          provider.providerName
        ),

      firstName:
        clean(
          name.first
        ),

      lastName:
        clean(
          name.last
        ),

      languages:
        uniqueStrings([
          ...(Array.isArray(
            provider.languages
          )
            ? provider.languages
            : []),
        ]),

      specialties,

      specialtyCodes,

      accepting,

      addresses:
        dedupeAddresses(
          addresses
        ),

      website:
        clean(
          provider.website
        ),

      email:
        clean(
          provider.email
        ),

      medicalGroup:
        clean(
          provider.medicalGroup
        ),

      telehealth:
        clean(
          provider.telehealth
        ),

      oudExpertise:
        clean(
          provider.oudExpertise
        ),

      directoryType:
        "Specialists",
    };

  return normalized;
}

// ============================================================
// FACILITY NORMALIZATION
// ============================================================

function normalizeFacility(
  facility
) {
  if (
    !facility ||
    clean(
      facility.type
    ).toLowerCase() !==
      "facility"
  ) {
    return null;
  }

  const plans =
    Array.isArray(
      facility.plans
    )
      ? facility.plans
      : [];

  const yearPlans =
    plans.length
      ? plans.filter(
          (plan) =>
            getPlanYears(
              plan
            ).includes(
              PROVIDER_CONFIG.YEAR
            )
        )
      : [];

  if (
    plans.length &&
    !yearPlans.length
  ) {
    return null;
  }

  const usablePlans =
    yearPlans.length
      ? yearPlans
      : plans;

  const facilityCodes =
    uniqueStrings([
      ...(Array.isArray(
        facility.facilityType
      )
        ? facility.facilityType
        : []),

      ...usablePlans.flatMap(
        (plan) =>
          Array.isArray(
            plan.specialty
          )
            ? plan.specialty
            : []
      ),
    ]);

  const facilitySpecialties =
    uniqueStrings(
      facilityCodes.map(
        (code) =>
          PROVIDER_CONFIG
            .FACILITY_SPECIALTY_MAP[
            code
          ] || ""
      )
    );

  const addresses =
    [];

  for (
    const plan of
      usablePlans
  ) {
    if (
      Array.isArray(
        plan.addresses
      )
    ) {
      addresses.push(
        ...plan.addresses
      );
    }
  }

  if (
    Array.isArray(
      facility.addresses
    )
  ) {
    addresses.push(
      ...facility.addresses
    );
  }

  return {
    npi:
      normalizeNpi(
        facility.npi
      ),

    type:
      "Facility",

    name:
      clean(
        facility.facilityName
      ) ||
      clean(
        facility.name
      ) ||
      clean(
        facility.providerName
      ),

    facilityCodes,

    specialties:
      facilitySpecialties,

    addresses:
      dedupeAddresses(
        addresses
      ),

    directoryType:
      "Hospitals",
  };
}

// ============================================================
// LOCATION GROUPING
// ============================================================

function getProviderLocations(
  provider
) {
  const addresses =
    Array.isArray(
      provider.addresses
    )
      ? provider.addresses
      : [];

  if (
    !addresses.length
  ) {
    return [
      {
        state: "",
        county: "",
        city: "",
        zip: "",
        addresses: [],
      },
    ];
  }

  const map =
    new Map();

  for (
    const address of
      addresses
  ) {
    const key = [
      address.state,
      address.county,
      address.city,
      address.zip,
    ]
      .map(clean)
      .join("|");

    if (
      !map.has(key)
    ) {
      map.set(
        key,
        {
          state:
            address.state,

          county:
            address.county,

          city:
            address.city,

          zip:
            address.zip,

          addresses: [],
        }
      );
    }

    map
      .get(key)
      .addresses
      .push(address);
  }

  return [
    ...map.values(),
  ];
}

// ============================================================
// SORTING
// ============================================================

function getSortLocation(
  provider
) {
  return (
    provider.addresses?.[0] || {
      state: "",
      county: "",
      city: "",
      zip: "",
    }
  );
}

function buildGroups(
  pcpProviders,
  specialists,
  facilities
) {
  const groups =
    new Map();

  function add(
    provider
  ) {
    const section =
      provider.directoryType;

    if (
      !groups.has(
        section
      )
    ) {
      groups.set(
        section,
        []
      );
    }

    groups
      .get(section)
      .push(provider);
  }

  /*
   * PCPs are ONLY from MongoDB.
   */
  pcpProviders.forEach(
    add
  );

  /*
   * Specialists are ONLY from JSON.
   */
  specialists.forEach(
    add
  );

  /*
   * Hospitals are ONLY from facility JSON.
   */
  facilities.forEach(
    add
  );

  const order = [
    "Primary Care Providers (PCPs)",
    "Specialists",
    "Hospitals",
  ];

  const sections =
    [
      ...groups.keys(),
    ].sort(
      (a, b) =>
        order.indexOf(a) -
        order.indexOf(b)
    );

  for (
    const section of
      sections
  ) {
    groups
      .get(section)
      .sort(
        (a, b) => {
          /*
           * Specialists:
           * specialty first.
           */
          if (
            section ===
            "Specialists"
          ) {
            const specialtyA =
              a.specialties
                ?.join(", ") ||
              "";

            const specialtyB =
              b.specialties
                ?.join(", ") ||
              "";

            const specialtyCompare =
              specialtyA.localeCompare(
                specialtyB
              );

            if (
              specialtyCompare !==
              0
            ) {
              return specialtyCompare;
            }
          }

          /*
           * PCPs and Specialists:
           * last name first.
           */
          if (
            section ===
              "Primary Care Providers (PCPs)" ||
            section ===
              "Specialists"
          ) {
            const lastNameA =
              clean(
                a.lastName
              );

            const lastNameB =
              clean(
                b.lastName
              );

            const lastNameCompare =
              lastNameA.localeCompare(
                lastNameB
              );

            if (
              lastNameCompare !==
              0
            ) {
              return lastNameCompare;
            }
          }

          const aa =
            getSortLocation(
              a
            );

          const bb =
            getSortLocation(
              b
            );

          const state =
            clean(
              aa.state
            ).localeCompare(
              clean(
                bb.state
              )
            );

          if (
            state !==
            0
          ) {
            return state;
          }

          const county =
            clean(
              aa.county
            ).localeCompare(
              clean(
                bb.county
              )
            );

          if (
            county !==
            0
          ) {
            return county;
          }

          const city =
            clean(
              aa.city
            ).localeCompare(
              clean(
                bb.city
              )
            );

          if (
            city !==
            0
          ) {
            return city;
          }

          const zip =
            clean(
              aa.zip
            ).localeCompare(
              clean(
                bb.zip
              )
            );

          if (
            zip !==
            0
          ) {
            return zip;
          }

          return clean(
            a.name
          ).localeCompare(
            clean(
              b.name
            )
          );
        }
      );
  }

  return {
    groups,
    sections,
  };
}

// ============================================================
// TEXT WRAPPING
// ============================================================

function wrapText(
  text,
  font,
  size,
  maxWidth
) {
  const normalized =
    String(text || "")
      .trim();

  if (!normalized) {
    return [];
  }

  const words =
    normalized.split(
      /\s+/
    );

  const lines = [];

  let current =
    "";

  for (
    const word of
      words
  ) {
    const test =
      current
        ? `${current} ${word}`
        : word;

    if (
      font.widthOfTextAtSize(
        test,
        size
      ) <=
      maxWidth
    ) {
      current =
        test;
    } else {
      if (current) {
        lines.push(
          current
        );
      }

      /*
       * Protect against a single
       * very long word.
       */
      if (
        font.widthOfTextAtSize(
          word,
          size
        ) >
        maxWidth
      ) {
        let part =
          "";

        for (
          const char of
            word
        ) {
          const testPart =
            part + char;

          if (
            font.widthOfTextAtSize(
              testPart,
              size
            ) <=
            maxWidth
          ) {
            part =
              testPart;
          } else {
            if (part) {
              lines.push(
                part
              );
            }

            part = char;
          }
        }

        current =
          part;
      } else {
        current =
          word;
      }
    }
  }

  if (current) {
    lines.push(
      current
    );
  }

  return lines;
}

// ============================================================
// LOCATION HEADER
// ============================================================

function getLocationHeaderLines(
  location,
  fonts,
  columnWidth
) {
  const result =
    [];

  const values = [
    location.state,

    location.county
      ? `${location.county} County`
      : "",

    location.city,

    location.zip,
  ];

  for (
    const value of
      values
  ) {
    if (
      !clean(value)
    ) {
      continue;
    }

    const wrapped =
      wrapText(
        value,
        fonts.bold,
        CONFIG.LOCATION_HEADING_SIZE,
        columnWidth
      );

    for (
      const line of
        wrapped
    ) {
      result.push({
        text:
          line,

        font:
          fonts.bold,

        size:
          CONFIG.LOCATION_HEADING_SIZE,

        gapAfter:
          2,
      });
    }
  }

  return result;
}

// ============================================================
// PROVIDER CONTENT
// ============================================================

function getProviderLines(
  provider,
  location,
  fonts,
  columnWidth
) {
  const lines =
    [];

  /*
   * Specialist type comes first.
   */
  if (
    provider.directoryType ===
      "Specialists" &&
    provider.specialties?.length
  ) {
    lines.push({
      value:
        provider.specialties.join(
          ", "
        ),

      font:
        fonts.bold,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        2,
    });
  }

  /*
   * Hospital specialty/type.
   */
  if (
    provider.directoryType ===
      "Hospitals" &&
    provider.specialties?.length
  ) {
    lines.push({
      value:
        provider.specialties.join(
          ", "
        ),

      font:
        fonts.bold,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        2,
    });
  }

  /*
   * Provider / hospital name.
   */
  if (
    provider.name
  ) {
    lines.push({
      value:
        provider.name,

      font:
        fonts.bold,

      size:
        CONFIG.NAME_SIZE,

      gapAfter:
        2.5,
    });
  }

  /*
   * PCP accepting status.
   */
  if (
    provider.directoryType ===
      "Primary Care Providers (PCPs)" &&
    provider.accepting
  ) {
    lines.push({
      value:
        `Accepting New Patients? ${provider.accepting}`,

      font:
        fonts.font,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        2,
    });
  }

  /*
   * Degree.
   */
  if (
    provider.directoryType ===
      "Primary Care Providers (PCPs)" &&
    provider.degree
  ) {
    lines.push({
      value:
        `Degree: ${provider.degree}`,

      font:
        fonts.font,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        2,
    });
  }

  /*
   * Addresses.
   */
  const addresses =
    location.addresses ||
    [];

  for (
    const address of
      addresses
  ) {
    const street =
      [
        address.address,
        address.address2,
      ]
        .filter(Boolean)
        .join(", ");

    if (street) {
      lines.push({
        value:
          street,

        font:
          fonts.font,

        size:
          CONFIG.DETAIL_SIZE,

        gapAfter:
          1.5,
      });
    }

    const cityStateZip =
      [
        address.city,
        address.state,
        address.zip,
      ]
        .filter(Boolean)
        .join(", ");

    if (cityStateZip) {
      lines.push({
        value:
          cityStateZip,

        font:
          fonts.font,

        size:
          CONFIG.DETAIL_SIZE,

        gapAfter:
          1.5,
      });
    }

    if (
      address.phone
    ) {
      lines.push({
        value:
          address.phone,

        font:
          fonts.font,

        size:
          CONFIG.DETAIL_SIZE,

        gapAfter:
          2,
      });
    }
  }

  /*
   * Languages.
   */
  if (
    provider.languages?.length
  ) {
    lines.push({
      value:
        `Languages: ${provider.languages.join(
          ", "
        )}`,

      font:
        fonts.font,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        2,
    });
  }

  /*
   * Optional fields.
   */
  if (
    provider.website
  ) {
    lines.push({
      value:
        `Website: ${provider.website}`,

      font:
        fonts.font,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        1.5,
    });
  }

  if (
    provider.email
  ) {
    lines.push({
      value:
        `Email: ${provider.email}`,

      font:
        fonts.font,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        1.5,
    });
  }

  if (
    provider.medicalGroup
  ) {
    lines.push({
      value:
        `Medical Group: ${provider.medicalGroup}`,

      font:
        fonts.font,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        1.5,
    });
  }

  if (
    provider.telehealth
  ) {
    lines.push({
      value:
        `Telehealth: ${provider.telehealth}`,

      font:
        fonts.font,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        1.5,
    });
  }

  if (
    provider.oudExpertise
  ) {
    lines.push({
      value:
        `OUD Expertise: ${provider.oudExpertise}`,

      font:
        fonts.font,

      size:
        CONFIG.DETAIL_SIZE,

      gapAfter:
        1.5,
    });
  }

  /*
   * Wrap all content.
   */
  const result =
    [];

  for (
    const line of
      lines
  ) {
    const wrapped =
      wrapText(
        line.value,
        line.font,
        line.size,
        columnWidth
      );

    for (
      let i = 0;
      i <
      wrapped.length;
      i++
    ) {
      result.push({
        text:
          wrapped[i],

        font:
          line.font,

        size:
          line.size,

        gapAfter:
          i ===
          wrapped.length - 1
            ? line.gapAfter
            : 0,
      });
    }
  }

  return result;
}

// ============================================================
// ENTRY HEIGHT
// ============================================================

function calculateLocationEntryHeight(
  provider,
  location,
  fonts,
  columnWidth,
  includeLocationHeader
) {
  let height =
    0;

  if (
    includeLocationHeader
  ) {
    const headerLines =
      getLocationHeaderLines(
        location,
        fonts,
        columnWidth
      );

    for (
      const line of
        headerLines
    ) {
      height +=
        line.size +
        CONFIG.DETAIL_LINE_GAP +
        line.gapAfter;
    }

    height += 3;
  }

  const providerLines =
    getProviderLines(
      provider,
      location,
      fonts,
      columnWidth
    );

  for (
    const line of
      providerLines
  ) {
    height +=
      line.size +
      CONFIG.DETAIL_LINE_GAP +
      line.gapAfter;
  }

  height +=
    CONFIG.ENTRY_BOTTOM_GAP +
    4;

  return height;
}

// ============================================================
// DRAW LOCATION ENTRY
// ============================================================

function drawLocationEntry(
  page,
  provider,
  location,
  x,
  y,
  fonts,
  columnWidth,
  includeLocationHeader
) {
  let currentY =
    y;

  /*
   * Location header.
   */
  if (
    includeLocationHeader
  ) {
    const headerLines =
      getLocationHeaderLines(
        location,
        fonts,
        columnWidth
      );

    for (
      const line of
        headerLines
    ) {
      page.drawText(
        line.text,
        {
          x,

          y:
            currentY,

          size:
            line.size,

          font:
            line.font,

          color:
            CONFIG.BLACK,
        }
      );

      currentY -=
        line.size +
        CONFIG.DETAIL_LINE_GAP +
        line.gapAfter;
    }

    currentY -= 3;
  }

  /*
   * Provider content.
   */
  const providerLines =
    getProviderLines(
      provider,
      location,
      fonts,
      columnWidth
    );

  for (
    const line of
      providerLines
  ) {
    page.drawText(
      line.text,
      {
        x,

        y:
          currentY,

        size:
          line.size,

        font:
          line.font,

        color:
          CONFIG.BLACK,
      }
    );

    currentY -=
      line.size +
      CONFIG.DETAIL_LINE_GAP +
      line.gapAfter;
  }

  /*
   * Separator.
   */
  const separatorY =
    currentY - 2;

  page.drawLine({
    start: {
      x,

      y:
        separatorY,
    },

    end: {
      x:
        x + columnWidth,

      y:
        separatorY,
    },

    thickness:
      CONFIG.SEPARATOR_WIDTH,

    color:
      CONFIG.LIGHT_LINE,
  });

  return (
    separatorY -
    CONFIG.ENTRY_BOTTOM_GAP
  );
}

// ============================================================
// INTRODUCTION PAGE
// ============================================================

function drawWrappedBlock(
  page,
  block,
  fonts,
  y
) {
  const font =
    block.bold
      ? fonts.bold
      : fonts.font;

  const maxWidth =
    CONFIG.PAGE_WIDTH -
    CONFIG.LEFT_MARGIN -
    CONFIG.RIGHT_MARGIN;

  const lines =
    [];

  const paragraphs =
    String(
      block.text
    ).split("\n");

  for (
    const paragraph of
      paragraphs
  ) {
    if (
      !paragraph.trim()
    ) {
      lines.push("");
      continue;
    }

    lines.push(
      ...wrapText(
        paragraph,
        font,
        block.size,
        maxWidth
      )
    );
  }

  let currentY =
    y;

  for (
    const line of
      lines
  ) {
    if (!line) {
      currentY -=
        block.size;

      continue;
    }

    let x =
      CONFIG.LEFT_MARGIN;

    if (
      block.center
    ) {
      const width =
        font.widthOfTextAtSize(
          line,
          block.size
        );

      x =
        (
          CONFIG.PAGE_WIDTH -
          width
        ) /
        2;
    }

    page.drawText(
      line,
      {
        x,

        y:
          currentY,

        size:
          block.size,

        font,

        color:
          CONFIG.BLACK,
      }
    );

    currentY -=
      block.size + 3;
  }

  return (
    currentY -
    block.gap
  );
}

function createIntroductionPage(
  pdfDoc,
  blocks,
  fonts
) {
  const page =
    pdfDoc.addPage([
      CONFIG.PAGE_WIDTH,
      CONFIG.PAGE_HEIGHT,
    ]);

  let y =
    CONFIG.PAGE_HEIGHT -
    55;

  for (
    const block of
      blocks
  ) {
    y =
      drawWrappedBlock(
        page,
        block,
        fonts,
        y
      );
  }

  return page;
}

// ============================================================
// CLEAR TEMPLATE DIRECTORY PAGE
// ============================================================

function clearDirectoryTemplate(
  page
) {
  /*
   * Cover provider body.
   */
  page.drawRectangle({
    x: 0,

    y:
      CONFIG.COVER_BODY_FROM_Y,

    width:
      CONFIG.PAGE_WIDTH,

    height:
      CONFIG.COVER_BODY_TO_Y -
      CONFIG.COVER_BODY_FROM_Y,

    color:
      rgb(
        1,
        1,
        1
      ),
  });

  /*
   * Cover old heading.
   */
  page.drawRectangle({
    x: 0,

    y: 690,

    width:
      CONFIG.PAGE_WIDTH,

    height: 65,

    color:
      rgb(
        1,
        1,
        1
      ),
  });

  /*
   * Cover old footer.
   */
  page.drawRectangle({
    x: 0,

    y: 0,

    width:
      CONFIG.PAGE_WIDTH,

    height: 42,

    color:
      rgb(
        1,
        1,
        1
      ),
  });
}

// ============================================================
// CREATE DIRECTORY PAGE
// ============================================================

async function createDirectoryPage(
  pdfDoc,
  sourceDoc,
  sectionTitle,
  fonts,
  pageNumber
) {
  /*
   * IMPORTANT:
   *
   * Copy the actual sample page from
   * the original source document.
   *
   * This preserves the template layout.
   */
  const [
    copiedPage,
  ] =
    await pdfDoc.copyPages(
      sourceDoc,
      [
        CONFIG.SAMPLE_PAGE_INDEX,
      ]
    );

  pdfDoc.addPage(
    copiedPage
  );

  /*
   * Remove sample provider content.
   */
  clearDirectoryTemplate(
    copiedPage
  );

  /*
   * Section heading.
   */
  copiedPage.drawText(
    clean(
      sectionTitle
    ),
    {
      x:
        CONFIG.LEFT_MARGIN,

      y: 723,

      size:
        CONFIG.SECTION_HEADING_SIZE,

      font:
        fonts.bold,

      color:
        CONFIG.SECTION_COLOR,
    }
  );

  /*
   * Footer.
   */
  copiedPage.drawText(
    CONFIG.FOOTER_TEXT,
    {
      x:
        CONFIG.LEFT_MARGIN,

      y: 15,

      size:
        CONFIG.FOOTER_SIZE,

      font:
        fonts.font,

      color:
        CONFIG.FOOTER_COLOR,
    }
  );

  /*
   * Page number.
   */
  const pageText =
    `Page ${pageNumber}`;

  const pageTextWidth =
    fonts.font.widthOfTextAtSize(
      pageText,
      CONFIG.FOOTER_SIZE
    );

  copiedPage.drawText(
    pageText,
    {
      x:
        CONFIG.PAGE_WIDTH -
        CONFIG.RIGHT_MARGIN -
        pageTextWidth,

      y: 15,

      size:
        CONFIG.FOOTER_SIZE,

      font:
        fonts.font,

      color:
        CONFIG.FOOTER_COLOR,
    }
  );

  return copiedPage;
}

// ============================================================
// RENDER SECTION
// ============================================================

async function renderSection(
  pdfDoc,
  sourceDoc,
  section,
  providers,
  fonts,
  columnWidth,
  pageNumber
) {
  console.log(
    `Generating section: ${section}`
  );

  let currentPage =
    await createDirectoryPage(
      pdfDoc,
      sourceDoc,
      section,
      fonts,
      pageNumber
    );

  pageNumber++;

  /*
   * Current Y position for each column.
   */
  let columnY =
    Array(
      CONFIG.COLUMN_COUNT
    ).fill(
      CONFIG.CONTENT_TOP
    );

  /*
   * Track location heading
   * currently used in each column.
   */
  let columnLocationKeys =
    Array(
      CONFIG.COLUMN_COUNT
    ).fill("");

  for (
    const provider of
      providers
  ) {
    const locations =
      getProviderLocations(
        provider
      );

    for (
      const location of
        locations
    ) {
      const locationKey =
        [
          location.state,
          location.county,
          location.city,
          location.zip,
        ]
          .map(clean)
          .join("|");

      let placed =
        false;

      /*
       * Try all columns on current page.
       */
      for (
        let col = 0;
        col <
        CONFIG.COLUMN_COUNT;
        col++
      ) {
        const includeHeader =
          columnLocationKeys[
            col
          ] !==
          locationKey;

        const requiredHeight =
          calculateLocationEntryHeight(
            provider,
            location,
            fonts,
            columnWidth,
            includeHeader
          );

        if (
          columnY[col] -
            requiredHeight >=
          CONFIG.CONTENT_BOTTOM
        ) {
          const x =
            CONFIG.LEFT_MARGIN +
            col *
              (
                columnWidth +
                CONFIG.COLUMN_GAP
              );

          columnY[col] =
            drawLocationEntry(
              currentPage,
              provider,
              location,
              x,
              columnY[col],
              fonts,
              columnWidth,
              includeHeader
            );

          columnLocationKeys[
            col
          ] =
            locationKey;

          placed = true;

          break;
        }
      }

      /*
       * No column has space.
       * Create a new page.
       */
      if (!placed) {
        currentPage =
          await createDirectoryPage(
            pdfDoc,
            sourceDoc,
            section,
            fonts,
            pageNumber
          );

        pageNumber++;

        columnY =
          Array(
            CONFIG.COLUMN_COUNT
          ).fill(
            CONFIG.CONTENT_TOP
          );

        columnLocationKeys =
          Array(
            CONFIG.COLUMN_COUNT
          ).fill("");

        /*
         * Place the current entry
         * in the first column.
         */
        columnY[0] =
          drawLocationEntry(
            currentPage,
            provider,
            location,
            CONFIG.LEFT_MARGIN,
            columnY[0],
            fonts,
            columnWidth,
            true
          );

        columnLocationKeys[
          0
        ] =
          locationKey;
      }
    }
  }

  return pageNumber;
}

// ============================================================
// MAIN PDF GENERATOR
// ============================================================

async function generateProviderDirectory() {
  console.log(
    "Starting provider directory generation..."
  );

  // ----------------------------------------------------------
  // Validate input files
  // ----------------------------------------------------------

  assertFileExists(
    CONFIG.templatePath,
    "Provider PDF template"
  );

  assertFileExists(
    CONFIG.individualsPath,
    "Provider JSON"
  );

  assertFileExists(
    CONFIG.facilitiesPath,
    "Facility JSON"
  );

  // ----------------------------------------------------------
  // Load template
  // ----------------------------------------------------------

  const templateBytes =
    fs.readFileSync(
      CONFIG.templatePath
    );

  if (
    !templateBytes ||
    templateBytes
      .subarray(
        0,
        5
      )
      .toString() !==
      "%PDF-"
  ) {
    throw new Error(
      "Template is not a valid PDF."
    );
  }

  const sourceDoc =
    await PDFDocument.load(
      templateBytes
    );

  const templatePageCount =
    sourceDoc.getPageCount();

  console.log(
    `Template pages: ${templatePageCount}`
  );

  if (
    CONFIG.SAMPLE_PAGE_INDEX <
      0 ||
    CONFIG.SAMPLE_PAGE_INDEX >=
      templatePageCount
  ) {
    throw new Error(
      `SAMPLE_PAGE_INDEX ${CONFIG.SAMPLE_PAGE_INDEX} is invalid. Template contains ${templatePageCount} pages.`
    );
  }

  // ----------------------------------------------------------
  // Create output PDF
  // ----------------------------------------------------------

  const pdfDoc =
    await PDFDocument.create();

  // ----------------------------------------------------------
  // Fonts
  // ----------------------------------------------------------

  const font =
    await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

  const bold =
    await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

  const fonts = {
    font,
    bold,
  };

  // ----------------------------------------------------------
  // Introduction page 1
  // ----------------------------------------------------------

  createIntroductionPage(
    pdfDoc,
    INTRO_PAGE_1,
    fonts
  );

  // ----------------------------------------------------------
  // Introduction page 2
  // ----------------------------------------------------------

  createIntroductionPage(
    pdfDoc,
    INTRO_PAGE_2,
    fonts
  );

  // ----------------------------------------------------------
  // GET PCP DATA FROM MONGODB
  // ----------------------------------------------------------

  const pcpRows =
    await getPCPsFromMongoDB();

  /*
   * IMPORTANT:
   *
   * MongoDB is the authoritative source
   * for PCPs.
   *
   * No Excel is used anywhere.
   */
  const pcpProviders =
    buildPCPsFromMongoRows(
      pcpRows
    );

  // ----------------------------------------------------------
  // READ SPECIALISTS
  // ----------------------------------------------------------

  const rawIndividuals =
    readJson(
      CONFIG.individualsPath
    );

  /*
   * IMPORTANT:
   *
   * We DO NOT remove specialists based
   * on PCP NPI.
   *
   * MongoDB controls PCP section.
   *
   * JSON controls Specialist section.
   */
  const specialists =
    rawIndividuals
      .map(
        normalizeIndividual
      )
      .filter(Boolean);

  // ----------------------------------------------------------
  // READ HOSPITALS
  // ----------------------------------------------------------

  const rawFacilities =
    readJson(
      CONFIG.facilitiesPath
    );

  const facilities =
    rawFacilities
      .map(
        normalizeFacility
      )
      .filter(Boolean);

  // ----------------------------------------------------------
  // LOG DATA COUNTS
  // ----------------------------------------------------------

  console.log(
    `PCP database rows: ${pcpRows.length}`
  );

  console.log(
    `PCPs from MongoDB: ${pcpProviders.length}`
  );

  console.log(
    `Specialists from JSON: ${specialists.length}`
  );

  console.log(
    `Hospitals from JSON: ${facilities.length}`
  );

  // ----------------------------------------------------------
  // BUILD GROUPS
  // ----------------------------------------------------------

  const {
    groups,
    sections,
  } =
    buildGroups(
      pcpProviders,
      specialists,
      facilities
    );

  console.log(
    "Sections:",
    sections
  );

  // ----------------------------------------------------------
  // Column width
  // ----------------------------------------------------------

  const totalGap =
    CONFIG.COLUMN_GAP *
    (
      CONFIG.COLUMN_COUNT -
      1
    );

  const columnWidth =
    (
      CONFIG.PAGE_WIDTH -
      CONFIG.LEFT_MARGIN -
      CONFIG.RIGHT_MARGIN -
      totalGap
    ) /
    CONFIG.COLUMN_COUNT;

  console.log(
    `Column width: ${columnWidth.toFixed(
      2
    )}`
  );

  // ----------------------------------------------------------
  // Generate directory sections
  // ----------------------------------------------------------

  let pageNumber = 3;

  for (
    const section of
      sections
  ) {
    const providers =
      groups.get(
        section
      ) || [];

    if (
      !providers.length
    ) {
      continue;
    }

    pageNumber =
      await renderSection(
        pdfDoc,
        sourceDoc,
        section,
        providers,
        fonts,
        columnWidth,
        pageNumber
      );
  }

  // ----------------------------------------------------------
  // Save PDF
  // ----------------------------------------------------------

  const outputBytes =
    await pdfDoc.save({
      useObjectStreams:
        false,
    });

  const outputBuffer =
    Buffer.from(
      outputBytes
    );

  if (
    outputBuffer
      .subarray(
        0,
        5
      )
      .toString() !==
    "%PDF-"
  ) {
    throw new Error(
      "Generated PDF is invalid."
    );
  }

  // ----------------------------------------------------------
  // Create output directory
  // ----------------------------------------------------------

  fs.mkdirSync(
    path.dirname(
      CONFIG.outputPath
    ),
    {
      recursive: true,
    }
  );

  // ----------------------------------------------------------
  // Write PDF
  // ----------------------------------------------------------

  fs.writeFileSync(
    CONFIG.outputPath,
    outputBuffer
  );

  const stat =
    fs.statSync(
      CONFIG.outputPath
    );

  // ----------------------------------------------------------
  // Final output
  // ----------------------------------------------------------

  console.log(
    "\n========================================"
  );

  console.log(
    "Provider directory generated successfully."
  );

  console.log(
    `Output: ${path.resolve(
      CONFIG.outputPath
    )}`
  );

  console.log(
    `Size: ${(
      stat.size / 1024
    ).toFixed(2)} KB`
  );

  console.log(
    `Pages: ${pdfDoc.getPageCount()}`
  );

  console.log(
    `PCPs: ${
      groups.get(
        "Primary Care Providers (PCPs)"
      )?.length || 0
    }`
  );

  console.log(
    `Specialists: ${
      groups.get(
        "Specialists"
      )?.length || 0
    }`
  );

  console.log(
    `Hospitals: ${
      groups.get(
        "Hospitals"
      )?.length || 0
    }`
  );

  console.log(
    "========================================\n"
  );
}

module.exports = {
  generateProviderDirectory,
};
// ============================================================
// RUN
// ============================================================

