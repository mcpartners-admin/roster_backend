const fs = require("fs-extra");
const path = require("path");
const XLSX = require("xlsx");
const Provider = require("../schemas/provider.schema");
const { convertExcelToCmsJson } = require("../converter/cms.converter");
const { validateNormalizedRow } = require("../validators/provider.validators");
const { finalizeFacility,createFacility,mergeNormalizedRowIntoFacility } = require("../builders/provider.builder");
const { createValidationLogger } = require("../logger/validation.logger");


const getProvidersByRoster = async (rosterName) => {
  return Provider.find({ rosterName }).lean();
};

const convertExcelToJson = async (filePath) => {
  const result = await convertExcelToCmsJson(filePath);
  return result.summary;
};

const convertFacilityExcelToJson = async (filePath) => {
  const outputDir = path.join(__dirname, "../jsonfiles");
  const startTime = process.hrtime.bigint();

  console.log(`Starting Facility conversion: ${filePath}`);

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  const logger = createValidationLogger(
    path.resolve(__dirname, "..", "..")
  );

  const facilities = new Map();
  let skippedRows = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];

    // Normalize Facility Excel row
    const normalizedRow = {
      npi: String(row["npi"] || "").trim(),
      type: String(row["facility type"]),
      facilityName: String(row["facility name"] || "").trim(),

      facilityType: row["type"]
        ? [String(row["type"]).trim()]
        : [],

      specialty: row["HPMS Facility Specialty Codes"]
        ? [String(row["HPMS Facility Specialty Codes"]).trim()]
        : [],

      address: String(row["address (required)"] || "").trim(),
      address2: "",
      city: String(row["city (required)"] || "").trim(),
      state: String(row["state (required)"] || "").trim(),
      zip: String(row["zip (required)"] || "").trim(),
      phone: String(row["phone (required)"] || "").trim(),
      accepting: "",
      network: "",
      year: row[" contract year (required)"]
        ? [String(row[" contract year (required)"]).trim()]
        : [],
    };

    if (!normalizedRow.npi) {
      skippedRows += 1;
      logger.record(index + 2, "", {
        field: "npi",
        message: "Missing NPI",
        severity: "error",
      });
      continue;
    }

    const facilityKey = normalizedRow.npi;
    let facility = facilities.get(facilityKey);

    if (!facility) {
      facility = createFacility(normalizedRow);
      facilities.set(facilityKey, facility);
    }

    const isUpdated = mergeNormalizedRowIntoFacility(
      facility,
      normalizedRow
    );

    if (!isUpdated) {
      logger.record(index + 2, normalizedRow.npi, {
        field: "npi",
        message: `Duplicate facility found with NPI ${normalizedRow.npi}`,
        severity: "warning",
      });
    }
  }

  const finalizedFacilities = Array.from(facilities.values()).map(
    finalizeFacility
  );

  const outputPath = path.join(outputDir, "facility.json");
  await fs.ensureDir(outputDir);
  fs.writeFileSync(
    outputPath,
    JSON.stringify(finalizedFacilities, null, 2),
    "utf8"
  );
  console.log(`Saved Facility JSON to ${outputPath}`);
  const endTime = process.hrtime.bigint();
  const memoryUsage = process.memoryUsage();

  const summary = {
    totalRows: rows.length,
    validRows: finalizedFacilities.length,
    skippedRows,
    executionTime: `${Number(endTime - startTime) / 1e6}ms`,
    memoryUsage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    },
    duplicateFacilities: rows.length - finalizedFacilities.length,
    warnings: logger.counts().warnings,
    errors: logger.counts().errors,
    performance: {
      rowsPerSecond:
        rows.length > 0
          ? Math.round(rows.length / (Number(endTime - startTime) / 1e9))
          : 0,
    },
  };
  await logger.write(summary);
  return {
    summary,
  };
};

const addRosterData = async (
  rosterData,
  rosterName = "providers",
  jsonFilePath = ""
) => {
  try {
    console.log(`Received ${rosterData.length} providers`);

    const providers = rosterData.map((provider) => ({
      jsonFilePath,
      npi: String(provider.npi || "").trim(),
      type: provider.type === "Facility" ? "Facility" : "Individual",
      lastUpdatedOn:
        provider.lastUpdatedOn ||
        new Date().toISOString().split("T")[0],

      ...(provider.type === "Facility"
        ? {
            facilityName: provider.facilityName || "",
            facilityType: provider.facilityType || [],
          }
        : {
            name: {
              prefix: provider.name?.prefix || "",
              first: provider.name?.first || "",
              middle: provider.name?.middle || "",
              last: provider.name?.last || "",
              suffix: provider.name?.suffix || "",
            },

            sex: provider.sex || "",

            languages:
              provider.languages?.length > 0
                ? provider.languages
                : ["English"],
          }),

      plans: (provider.plans || []).map((plan) => ({
        maPlanId: plan.maPlanId,

        yearContractYear:
          Array.isArray(plan.year) && plan.year.length
            ? String(plan.year[0])
            : "2027",

        specialty: Array.isArray(plan.specialty)
          ? [...new Set(plan.specialty)]
          : [],

        accepting:
          String(plan.accepting || "")
            .trim()
            .toLowerCase() === "accepting"
            ? "Accepting"
            : "Not Accepting",

        networkId:
          Array.isArray(plan.networks) && plan.networks.length
            ? plan.networks.join(",")
            : "",

        addresses: (plan.addresses || []).map((address) => ({
          address: String(address.address || "").trim(),

          address2: String(
            address.address2 || address.address_2 || ""
          ).trim(),

          city: String(address.city || "").trim(),

          state: String(address.state || "")
            .trim()
            .toUpperCase(),

          zip: String(address.zip || "").replace(/\D/g, ""),

          phone: String(address.phone || "").replace(/\D/g, ""),
        })),
      })),
    }));

    console.log(`Mapped ${providers.length} providers`);

    let inserted = 0;
    const failed = [];

    for (const provider of providers) {
      try {
        console.log(`Saving ${provider.npi}`);

        const doc = new Provider(provider);

        await doc.validate();

        await doc.save();

        inserted++;

        console.log(`✔ ${provider.npi} inserted`);
      } catch (err) {
        console.log(`✖ ${provider.npi} failed`);

        failed.push({
          npi: provider.npi,
          message: err.message,
        });

        if (err.name === "ValidationError") {
          Object.values(err.errors).forEach((e) => {
            console.log(
              `${e.path} => ${e.message} (value: ${e.value})`
            );
          });
        } else {
          console.log(err);
        }

        // continue with next provider
      }
    }

    console.log("--------------------------------");
    console.log(`Inserted : ${inserted}`);
    console.log(`Failed   : ${failed.length}`);

    if (failed.length) {
      console.table(failed);
    }

    return {
      inserted,
      failed,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
module.exports = {
  getProvidersByRoster,
  convertExcelToJson,
  addRosterData,
  convertFacilityExcelToJson
};
