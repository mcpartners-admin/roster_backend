const fs = require("fs-extra");
const XLSX = require("xlsx");
const FacilityProvider = require("../schemas/facility.provider.schema");
const CommonProvider = require("../schemas/common.provider.schema");

const normalizeHeader = (header) => String(header || "")
  .normalize("NFKD")
  .toLowerCase()
  .replace(/\u00a0/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const splitLanguages = (value) => String(value || "")
  .split(/[;,|]/)
  .map((language) => language.trim())
  .filter(Boolean);

const COMMON_FIELD_HEADERS = {
  taxId: ["tax id 1"],
  namePerW9: ["name per w-9", "name per w9"],
  npi: ["npi", "npi # ind", "npi (required)"],
  lastName: ["last name", "last name (required)"],
  firstName: ["first name", "first name (required)"],
  degree: ["degree"],
  sex: ["gender", "sex"],
  pcpSpec: ["pcp/spec"],
  primarySpecialty: ["primary specialty (required)", "primary specialty"],
  phone: ["office #", "phone (required)", "phone"],
  facilityName: ["facility name", "practice name"],
  facilityType: ["facility type"],
  address: ["address 1", "address line 1", "address (required)"],
  address2: ["address2", "adress line 2", "address line 2"],
  city: ["city 1", "city (required)", "city"],
  state: ["state 1", "state (required)", "state"],
  zip: ["zip 1", "zip (required)", "zip"],
  billingAddress: ["billing address 1"],
  billingCity: ["billing city 1"],
  billingState: ["billing state 1"],
  billingZip: ["billing zip 1"],
  county: ["county"],
  network: ["network"],
  effectiveDate: ["integranet effective date"],
  terminationDate: ["termination date"],
  credentialingStatus: ["credentialing status"],
  startDate: ["start date"],
  endDate: ["end date"],
  providerEntityName: ["provider_entity_name", "provider entity name"],
  providerTin: ["provider_tin", "provider tin"],
  providerId: ["provider_id", "provider id"],
  practiceId: ["practice_id", "practice id"],
  locationId: ["location_id", "location id"],
  languages: ["languages (required)", "languages"],
  contractYear: ["contract year (required)", "contract year"],
  secondarySpecialty: ["secondary speciality", "secondary specialty"],
  primarySpecialtyCode: ["primary specialty code (required)", "primary specialty code"],
};

const detectCommonType = (headers, cells) => {
  const has = (...names) => names.some((name) => headers.has(normalizeHeader(name)));
  const pcpSpec = String(cells[normalizeHeader("pcp/spec")] || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  if (pcpSpec === "PCP") return "primarycareproviders";
  if (pcpSpec === "PSEC") return "specialists";
  if (pcpSpec === "HOS") return "hospitals";

  const sourceType = String(
    cells[normalizeHeader("type (required)")] || cells[normalizeHeader("type")] || ""
  ).toLowerCase();
  if (/facility|hospital/.test(sourceType)) return "hospitals";
  if (/specialist|spec/.test(sourceType)) return "specialists";
  if (/primary|\bpcp\b/.test(sourceType)) return "primarycareproviders";
  if (/individual/.test(sourceType)) return "individuals";
  if (has("facility type", "contract year (required)", "primary specialty code (required)")) {
    return "hospitals";
  }
  if (has("pcp/spec")) {
    const label = String(cells[normalizeHeader("pcp/spec")] || "").toLowerCase();
    if (/spec/.test(label)) return "specialists";
    if (/pcp|primary/.test(label)) return "primarycareproviders";
    return "individuals";
  }
  if (has("provider_entity_name", "provider entity name", "provider_id", "provider id", "start date")) {
    return "primarycareproviders";
  }
  return "individuals";
};

const importCommonProvidersFromExcel = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath, { cellDates: false });
    const recognizedHeaders = new Set(Object.values(COMMON_FIELD_HEADERS).flat().map(normalizeHeader));
    recognizedHeaders.add(normalizeHeader("type (required)"));
    recognizedHeaders.add(normalizeHeader("type"));

    let selectedSheet;
    let selectedHeaderIndex = -1;
    let selectedHeaderScore = 0;
    for (const sheetName of workbook.SheetNames) {
      const candidateSheet = workbook.Sheets[sheetName];
      const grid = XLSX.utils.sheet_to_json(candidateSheet, {
        header: 1,
        defval: "",
        raw: false,
      });
      const candidate = grid.slice(0, 25).reduce((best, row, index) => {
        const score = row.filter((cell) => recognizedHeaders.has(normalizeHeader(cell))).length;
        return score > best.score ? { index, score } : best;
      }, { index: -1, score: 0 });
      if (candidate.score > selectedHeaderScore) {
        selectedSheet = candidateSheet;
        selectedHeaderIndex = candidate.index;
        selectedHeaderScore = candidate.score;
      }
    }

    if (!selectedSheet || selectedHeaderScore < 2) {
      throw invalidSpreadsheet("The worksheet headers do not match a supported provider spreadsheet");
    }

    const rows = XLSX.utils.sheet_to_json(selectedSheet, {
      range: selectedHeaderIndex,
      defval: "",
      raw: false,
    });
    const headers = new Set(Object.keys(rows[0] || {}).map(normalizeHeader));

    const documents = rows.filter((row) => {
      const values = Object.values(row).map((value) => String(value ?? "").trim());
      const text = values.join(" ").toLowerCase();
      return values.some(Boolean) && !/should be \d+|individual or facility|\[.*\]|\d+ digit number/.test(text);
    }).map((row) => {
      const cells = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [normalizeHeader(key), String(value ?? "").trim()])
      );
      const document = {};
      for (const [field, aliases] of Object.entries(COMMON_FIELD_HEADERS)) {
        let value = "";
        for (const alias of aliases) {
          value = cells[normalizeHeader(alias)] || "";
          if (value) break;
        }
        if (!value) continue;
        document[field] = field === "languages" ? splitLanguages(value) : value;
      }
      document.type = detectCommonType(headers, cells);
      return document;
    });

    const inserted = await CommonProvider.insertMany(documents, { ordered: true });
    return { importedCount: inserted.length };
  } finally {
    await fs.remove(filePath).catch(() => {});
  }
};

const invalidSpreadsheet = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const importFromExcel = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath, { cellDates: false });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw invalidSpreadsheet("The Excel file does not contain a worksheet");

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
    if (!rows.length) throw invalidSpreadsheet("The Excel worksheet is empty");

    const documents = rows.map((row, index) => {
      const cells = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [normalizeHeader(key), String(value ?? "").trim()])
      );
      const get = (...headers) => {
        for (const header of headers) {
          const value = cells[normalizeHeader(header)];
          if (value) return value;
        }
        return "";
      };

      const document = {
        npi: get("npi"),
        facilityType: get("facility type"),
        facilityName: get("facility name"),
        languages: splitLanguages(get("languages (required)", "languages")),
        contractYear: get("contract year (required)", "contract year"),
        primarySpecialty: get("primary specialty (required)", "primary specialty"),
        secondarySpeciality: get("secondary speciality", "secondary specialty"),
        primarySpecialtyCode: get("primary specialty code (required)", "primary specialty code"),
        address: get("address (required)", "address"),
        city: get("city (required)", "city"),
        state: get("state (required)", "state"),
        zip: get("zip (required)", "zip"),
        phone: get("phone (required)", "phone"),
      };

      const required = ["languages", "contractYear", "primarySpecialty", "primarySpecialtyCode", "address", "city", "state", "zip", "phone"];
      const missing = required.filter((field) => Array.isArray(document[field])
        ? document[field].length === 0
        : !document[field]);
      if (missing.length) {
        throw invalidSpreadsheet(`Excel row ${index + 2} is missing required value(s): ${missing.join(", ")}`);
      }
      return document;
    });

    const inserted = await FacilityProvider.insertMany(documents, { ordered: true });
    return { importedCount: inserted.length };
  } finally {
    await fs.remove(filePath).catch(() => {});
  }
};

module.exports = { importFromExcel, importCommonProvidersFromExcel };
