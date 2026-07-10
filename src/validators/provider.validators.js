const {
  PROVIDER_TYPES,
  PREFIXES,
  SUFFIXES,
  SEX_VALUES,
  ACCEPTING_VALUES,
  DATE_PATTERN,
  NPI_PATTERN,
  STATE_PATTERN,
  ZIP_PATTERN,
  PHONE_PATTERN,
  MA_PLAN_ID_PATTERN,
  SPECIALTY_PATTERN,
} = require("../config/cms.config");

function createIssue(field, message, value, severity = "error") {
  return {
    field,
    message,
    value,
    severity,
  };
}

function validateNormalizedRow(row = {}) {
  const errors = [];
  const warnings = [];

  if (!row.npi || !NPI_PATTERN.test(String(row.npi))) {
    errors.push(createIssue("npi", "NPI must be exactly 10 digits", row.npi));
  }

  // if (row.prefix && !PREFIXES.includes(row.prefix)) {
  //   errors.push(createIssue("prefix", "Prefix is not supported", row.prefix));
  // }
  // if (row.sex && !SEX_VALUES.includes(row.sex)) {
  //   errors.push(createIssue("sex", "Sex must be Male or Female", row.sex));
  // }

  // if (row.date && !DATE_PATTERN.test(String(row.date))) {
  //   errors.push(createIssue("date", "Date must use YYYY-MM-DD", row.date));
  // }

  if (row.maPlanId && !MA_PLAN_ID_PATTERN.test(String(row.maPlanId))) {
    errors.push(createIssue("maPlanId", "MA Plan ID must follow H9999-001-000", row.maPlanId));
  }

  if (!Array.isArray(row.year) || row.year.length !== 1) {
    errors.push(createIssue("year", "Year must contain exactly one value", row.year));
  }

  if (!row.address) {
    errors.push(createIssue("address", "Address is required", row.address));
  }

  if (!row.city) {
    errors.push(createIssue("city", "City is required", row.city));
  }

  if (!row.state || !STATE_PATTERN.test(String(row.state))) {
    errors.push(createIssue("state", "State must be two uppercase letters", row.state));
  }

  // if (!row.zip || !ZIP_PATTERN.test(String(row.zip))) {
  //   errors.push(createIssue("zip", "ZIP must be five digits", row.zip));
  // }

  // if (!row.phone || !PHONE_PATTERN.test(String(row.phone))) {
  //   errors.push(createIssue("phone", "Phone must be ten digits", row.phone));
  // }

  // if (!row.accepting || !ACCEPTING_VALUES.includes(row.accepting)) {
  //   errors.push(createIssue("accepting", "Accepting must be Accepting or Not Accepting", row.accepting));
  // }

  if (!Array.isArray(row.languages)) {
    errors.push(createIssue("languages", "Languages must be provided as an array", row.languages));
  }

  // if (row.specialty && !SPECIALTY_PATTERN.test(String(row.specialty))) {
  //   errors.push(createIssue("specialty", "Specialty must be N/A or a three-digit code", row.specialty));
  // }

  // if (!row.specialty && row.specialty !== "") {
  //   warnings.push(createIssue("specialty", "Specialty is missing", row.specialty, "warning"));
  // }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateNormalizedRow,
  createIssue,
};
