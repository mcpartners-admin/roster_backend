const {
  DEFAULT_YEAR,
} = require("../config/cms.config");

function normalizeString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  return value;
}

function normalizePhone(value) {
  return normalizeString(value);
}

function normalizeZip(value) {
  return normalizeString(value);
}

function normalizeState(value) {
  return normalizeString(value);
}

function normalizeSex(value) {
  return normalizeString(value);
}

function normalizeAccepting(value) {
  return normalizeString(value);
}

function normalizeType(value) {
  if (!value) {
    return null;
  }
  const type = String(value).trim().toUpperCase();
  return value; // or return null if you want to reject unknown values
}
function normalizeSpecialty(value) {
  return normalizeString(value);
}

function normalizeYear(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null && item !== "");
  }

  return value === undefined || value === null || value === "" ? [] : [value];
}

function pickValue(row, headers) {
  if (!row || typeof row !== "object") {
    return undefined;
  }

  const keys = Object.keys(row);
  for (const header of headers) {
    const matchedKey = keys.find(
      (key) => key.toLowerCase() === header.toLowerCase()
    );

    if (matchedKey) {
      return row[matchedKey];
    }
  }

  return undefined;
}

function normalizeRow(row = {}) {
  const normalized = {
    npi: normalizeString(pickValue(row, ["npi (required)"])),
    type: normalizeType(pickValue(row, ["type (required)"])),
    prefix: normalizeString(pickValue(row, ["prefix"])),
    firstName: normalizeString(pickValue(row, ["ﬁrst name (required)"])),
    middleName: normalizeString(pickValue(row, ["middle name"])),
    lastName: normalizeString(pickValue(row, ["last name (required)"])),
    suffix: normalizeString(pickValue(row, ["Suffix"])),
    sex: normalizeSex(pickValue(row, ["gender"])),
    lastUpdatedOn: normalizeString(pickValue(row, ["Last Updated On"])),
    languages: [
      normalizeString(pickValue(row, ["languages (required)"])),
    ].filter((item) => item !== undefined && item !== null && item !== ""),
    accepting: normalizeAccepting(pickValue(row, ["accepting"])),
    specialty: [
      normalizeSpecialty(pickValue(row, ["Primary Specialty code (required)"]))
    ].filter((item) => item !== undefined && item !== null && item !== ""),
    network: normalizeString(pickValue(row, ["networkId"])),
    year: normalizeYear(pickValue(row, [" contract year (required)"])),
    address: normalizeString(pickValue(row, ["address (required)"])),
    address2: normalizeString(pickValue(row, ["address2"])),
    city: normalizeString(pickValue(row, ["city (required)"])),
    state: normalizeState(pickValue(row, ["state (required)"])),
    zip: normalizeZip(pickValue(row, ["zip (required)"])),
    phone: normalizePhone(pickValue(row, ["phone (required)"])),
  };

  if (!normalized.year.length) {
    normalized.year = [...DEFAULT_YEAR];
  }

  return normalized;
}

module.exports = {
  normalizeRow,
  normalizeString,
  normalizePhone,
  normalizeZip,
  normalizeSex,
  normalizeState,
  normalizeAccepting,
  normalizeType,
  normalizeSpecialty,
  normalizeYear,
};