const XLSX = require("xlsx");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuid } = require("uuid");
const Provider = require("../schemas/provider.schema");

function splitName(fullName = "") {
  const parts = fullName.trim().split(/\s+/);

  return {
    prefix: "",
    first: parts[0] || "",
    middle: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    last: parts.length > 1 ? parts[parts.length - 1] : "",
    suffix: "",
  };
}


const getProvidersByRoster = async (rosterName) => {
  return Provider.find({ rosterName }).lean();
};

const convertExcelToJson = async (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });
console.log(workbook.SheetNames);
  const providers = {};
rows.forEach((row) => {
  const npi = String(row["NPI"] || "").trim();

  if (!npi) return;

  const providerType = String(row["Provider Type"] || "")
    .trim()
    .toUpperCase();

  const isFacility =
    providerType === "FACILITY" ||
    providerType === "GROUP" ||
    providerType === "ENTITY";

  const specialty = String(row["Specialty"] || "").trim();

  const providerName = splitName(
    String(row["Provider Name"] || "").trim()
  );

  if (!providers[npi]) {
    providers[npi] = {
      npi,
      type: isFacility ? "Facility" : "Individual",

      ...(isFacility
        ? {
            facilityName: String(
              row["Group/Entity Name"] ||
                row["Provider Name"] ||
                ""
            ).trim(),
            facilityType: specialty ? [specialty] : [],
          }
        : {
            name: {
              prefix: providerName.prefix,
              first: providerName.first,
              middle: providerName.middle,
              last: providerName.last,
              suffix: providerName.suffix,
            },
            sex: "",
            languages: ["English"],
          }),

      lastUpdatedOn: "",

      plans: [
        {
          maPlanId: "UNKNOWN",
          accepting: "",
          specialty: specialty ? [specialty] : [],
          addresses: [],
          networks: [],
          year: [],
        },
      ],
    };
  }

  const address = {
    address: String(row["STREET"] || "").trim(),
    address_2: "",
    city: String(row["CITY"] || "").trim(),
    state: String(row["STATE"] || "").trim(),
    zip: String(row["ZIP"] || "").trim(),
    phone: String(row["PHONE"] || "").trim(),
  };

  const exists = providers[npi].plans[0].addresses.some(
    (a) =>
      a.address === address.address &&
      a.city === address.city &&
      a.state === address.state &&
      a.zip === address.zip &&
      a.phone === address.phone
  );

  if (!exists) {
    providers[npi].plans[0].addresses.push(address);
  }
});
  const result = Object.values(providers);
  const outputFile = path.join("output", `${uuid()}.json`);

  await fs.ensureDir("output");
  await fs.writeJson(outputFile, result, {
    spaces: 2,
  });

  return outputFile;
};

const addRosterData = async (rosterData, rosterName = "providers") => {
  try {
    console.log(`Received ${rosterData.length} providers`);

    const providers = rosterData.map((provider) => ({
      rosterName,

      npi: String(provider.npi).trim(),

      type:
        provider.type === "FACILITY" ||
        provider.type === "Facility"
          ? "Facility"
          : "Individual",

      lastUpdatedOn:
        provider.lastUpdatedOn ||
        new Date().toISOString().split("T")[0],

      ...(provider.type === "Facility" ||
      provider.type === "FACILITY"
        ? {
            facilityName: provider.facilityName || "",
            facilityType: provider.facilityType || [],
          }
        : {
            name: {
              prefix: provider.name?.prefix || undefined,
              first: provider.name?.first || "",
              middle: provider.name?.middle || "",
              last: provider.name?.last || "",
              suffix: provider.name?.suffix || undefined,
            },
            sex:
              provider.sex === "Male" || provider.sex === "Female"
                ? provider.sex
                : undefined,
            languages:
              provider.languages?.length > 0
                ? provider.languages
                : ["English"],
          }),

      plans: (provider.plans || []).map((plan) => ({
        maPlanId: plan.maPlanId || "UNKNOWN",

        yearContractYear:
          plan.yearContractYear ||
          (plan.year && plan.year[0]) ||
          new Date().getFullYear().toString(),

        specialty: plan.specialty || [],

        accepting:
          String(plan.accepting).toLowerCase() === "accepting"
            ? "Accepting"
            : "Not Accepting",

        networkId:
          plan.networkId ||
          (plan.networks && plan.networks[0]) ||
          "",

        addresses: (plan.addresses || []).map((address) => ({
          address: address.address || "",
          address2: address.address2 || address.address_2 || "",
          city: address.city || "",
          state: String(address.state || "")
            .toUpperCase()
            .substring(0, 2),
          zip: String(address.zip || "")
            .replace(/\D/g, "")
            .substring(0, 5),
          phone: String(address.phone || "")
            .replace(/\D/g, "")
            .substring(0, 10),
        })),
      })),
    }));

    console.log("Mapped Providers:", providers.length);

    let inserted = 0;

    for (const provider of providers) {
      try {
        console.log("\n================================");
        console.log("Validating NPI:", provider.npi);

        const doc = new Provider(provider);

        await doc.validate();

        console.log("Validation Passed");

        await doc.save();

        inserted++;

        console.log("Saved Successfully");
      } catch (err) {
        console.log("\nValidation Failed");
        console.log("NPI:", provider.npi);

        if (err.name === "ValidationError") {
          Object.keys(err.errors).forEach((field) => {
            console.log("--------------------------------");
            console.log("Field :", field);
            console.log("Value :", err.errors[field].value);
            console.log("Message :", err.errors[field].message);
            console.log("Kind :", err.errors[field].kind);
          });
        } else {
          console.log(err);
        }

        // Stop on the first error
        throw err;
      }
    }

    console.log(`Inserted ${inserted} providers`);

    return inserted;
  } catch (err) {
    console.error("\n========== ERROR ==========");
    console.error(err);
    throw err;
  }
};



module.exports = {
  getProvidersByRoster,
  convertExcelToJson,
  addRosterData,
};
