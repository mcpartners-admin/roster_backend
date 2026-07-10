const fs = require("fs-extra");
const path = require("path");

function createValidationLogger(baseDir = path.resolve(__dirname, "..", "..")) {
  const logDir = path.join(baseDir, "logs");
  const reportDir = path.join(baseDir, "src", "reports");
  const errorEntries = [];
  const warningEntries = [];

  return {
    record(rowNumber, npi, issue) {
      const entry = {
        rowNumber,
        npi: npi || "N/A",
        field: issue.field,
        invalidValue: issue.value,
        reason: issue.message,
        severity: issue.severity || "error",
        timestamp: new Date().toISOString(),
      };

      if (entry.severity === "warning") {
        warningEntries.push(entry);
      } else {
        errorEntries.push(entry);
      }
    },
    async write(summary) {
      await fs.ensureDir(logDir);
      await fs.ensureDir(reportDir);

      const errorPath = path.join(logDir, "validation-errors.log");
      const warningPath = path.join(logDir, "validation-warnings.log");
      const summaryPath = path.join(reportDir, "validation-summary.json");

      await fs.writeFile(errorPath, errorEntries.map((entry) => JSON.stringify(entry)).join("\n") + (errorEntries.length ? "\n" : ""));
      await fs.writeFile(warningPath, warningEntries.map((entry) => JSON.stringify(entry)).join("\n") + (warningEntries.length ? "\n" : ""));
      await fs.writeJson(summaryPath, summary, { spaces: 2 });
    },
    counts() {
      return {
        errors: errorEntries.length,
        warnings: warningEntries.length,
      };
    },
  };
}

module.exports = {
  createValidationLogger,
};
