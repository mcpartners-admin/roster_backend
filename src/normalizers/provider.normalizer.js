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

  if (type === "PCP" || type === "SPC") {
    return "INDIVIDUAL";
  }

  if (type === "FAC") {
    return "FACILITY";
  }

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
    npi: normalizeString(pickValue(row, ["Provider NPI (Type1)"])),
    type: normalizeType(pickValue(row, ["Provider/Org Type (PCP,SPC,FAC)"])),
    prefix: normalizeString(pickValue(row, ["Degree"])),
    firstName: normalizeString(pickValue(row, ["Provider First Name"])),
    middleName: normalizeString(pickValue(row, ["Provider Middle Initial"])),
    lastName: normalizeString(pickValue(row, ["Provider Last Name"])),
    suffix: normalizeString(pickValue(row, ["Suffix"])),
    sex: normalizeSex(pickValue(row, ["Gender"])),
    lastUpdatedOn: normalizeString(pickValue(row, ["Last Updated On"])),
    languages: [
      normalizeString(pickValue(row, ["Language1"])),
      normalizeString(pickValue(row, ["Language2"])),
      normalizeString(pickValue(row, ["Language3"]))
    ].filter((item) => item !== undefined && item !== null && item !== ""),
    accepting: normalizeAccepting(pickValue(row, ["Panel Status (Accepting)"])),
    specialty: [
      normalizeSpecialty(pickValue(row, ["HSD Code SPC1"])),
      normalizeSpecialty(pickValue(row, ["HSD Code SPC2"])),
      normalizeSpecialty(pickValue(row, ["HSD Code SPC3"]))
    ].filter((item) => item !== undefined && item !== null && item !== ""),
    network: normalizeString(pickValue(row, ["networkId"])),
    year: normalizeYear(pickValue(row, ["Contract year (Required)"])),
    address: normalizeString(pickValue(row, ["Office Address"])),
    address2: normalizeString(pickValue(row, ["Office Address Line 2"])),
    city: normalizeString(pickValue(row, ["Office Address City"])),
    state: normalizeState(pickValue(row, ["Office Address State"])),
    zip: normalizeZip(pickValue(row, ["Office Address Zip"])),
    phone: normalizePhone(pickValue(row, ["Office Address Telephone"])),
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