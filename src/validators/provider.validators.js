function createIssue(field, message, value, severity = "error") {
  return {
    field,
    message,
    value,
    severity,
  };
}

function hasRequiredValue(value) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim() !== "";
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

function validateNormalizedRow(row = {}) {
  const errors = [];
  const warnings = [];

  const requiredFields = [
    { field: "npi", message: "NPI is required" },
    { field: "address", message: "Address is required" },
    { field: "city", message: "City is required" },
    { field: "state", message: "State is required" },
    { field: "zip", message: "ZIP is required" },
    { field: "phone", message: "Phone is required" },
    { field: "accepting", message: "Accepting is required" },
  ];

  requiredFields.forEach(({ field, message }) => {
    if (!hasRequiredValue(row[field])) {
      errors.push(createIssue(field, message, row[field]));
    }
  });

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
