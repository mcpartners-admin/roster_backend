const path = require("path");
const fs = require("fs-extra");
const XLSX = require("xlsx");
const { normalizeRow } = require("../normalizers/provider.normalizer");
const { validateNormalizedRow } = require("../validators/provider.validators");
const { createProvider, mergeNormalizedRowIntoProvider, finalizeProvider } = require("../builders/provider.builder");
const { createValidationLogger } = require("../logger/validation.logger");

async function convertExcelToCmsJson(filePath, outputDir = path.resolve(__dirname, "..", "jsonfiles")) {
  const startTime = process.hrtime.bigint();
  console.log(`Starting conversion of Excel file: ${startTime}`);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, {
  defval: "",
  raw: false,
});


  const logger = createValidationLogger(path.resolve(__dirname, "..", ".."));

  const providers = new Map();
  let skippedRows = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const normalizedRow = normalizeRow(row);
    const validation = validateNormalizedRow(normalizedRow);

    if (!validation.valid) {
      skippedRows += 1;
      validation.errors.forEach((issue) => logger.record(index + 2, normalizedRow.npi, issue));
      validation.warnings.forEach((issue) => logger.record(index + 2, normalizedRow.npi, issue));
      continue;
    }
    const providerKey = normalizedRow.npi;
    let provider = providers.get(providerKey);

    if (!provider) {
      provider = createProvider(normalizedRow);
      providers.set(providerKey, provider);
    }
    mergeNormalizedRowIntoProvider(provider, normalizedRow);
  }

  const finalizedProviders = Array.from(providers.values()).map(finalizeProvider);

  const outputPath = path.join(outputDir, "provider_directory.json");
  await fs.ensureDir(outputDir);
  fs.writeFileSync(
    outputPath,
    JSON.stringify(finalizedProviders, null, 2),
    "utf8"
  );

  console.log(`Saved to ${outputPath}`);
  const endTime = process.hrtime.bigint();
  const memoryUsage = process.memoryUsage();
  const summary = {
    totalRows: rows.length,
    validRows: finalizedProviders.length,
    skippedRows,
    executionTime: `${Number(endTime - startTime) / 1e6}ms`,
    memoryUsage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    },
    duplicateProviders: rows.length - finalizedProviders.length,
    warnings: logger.counts().warnings,
    errors: logger.counts().errors,
    performance: {
      rowsPerSecond: rows.length > 0 ? Math.round(rows.length / (Number(endTime - startTime) / 1e9)) : 0,
    },
  };
  await logger.write(summary);
  return {
    // outputFile,
    summary,
  };
}

module.exports = {
  convertExcelToCmsJson,
};
