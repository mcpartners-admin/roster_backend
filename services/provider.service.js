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


const headers = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
})[0];

console.log(headers);

  const providers = {};
rows.forEach((row) => {
  const npi = String(row["npi"] || "").trim();

  if (!npi) return;
let specialty = String(row["Specialty code"] || "").trim();

if (/^(n\/?a)$/i.test(specialty)) {
  specialty = "N/A";
} else if (/^\d+$/.test(specialty)) {
  specialty = specialty.padStart(3, "0");
}
  const networkId = String(row["networkId"] || "").trim();

  const address = {
    address: String(row["address"] || "").trim(),
    address_2: String(row["address2"] || "").trim(),
    city: String(row["city"] || "").trim(),
    state: String(row["state"] || "").trim(),
    zip: String(row["zip"] || "").trim(),
    phone: String(row["phone"] || "").trim(),
  };

  // Create provider only once per NPI
  if (!providers[npi]) {
    providers[npi] = {
      npi,
      type: "Individual",

      name: {
        prefix: String(row["prefix"] || "").trim(),
        first: String(row["ﬁrst name"] || "").trim(),
        middle: String(row["middle name'"] || "").trim(),
        last: String(row["last name"] || "").trim(),
        suffix: String(row["suffix"] || "").trim(),
      },

      sex: String(row["sex"] || "").trim(),

      languages: ["English"],

      lastUpdatedOn:
        String(row["lastUpdatedOn"] || "").trim() ||
        new Date().toISOString().split("T")[0],

      plans: [
        {
          maPlanId: "H5767-001-000",
          accepting: String(row["accepting"] || "").trim(),
          specialty: [],
          addresses: [],
          networks: [],
          year: ["2027"],
        },
        {
          maPlanId: "H5767-002-000",
          accepting: String(row["accepting"] || "").trim(),
          specialty: [],
          addresses: [],
          networks: [],
          year: ["2027"],
        },
        {
          maPlanId: "H5767-003-000",
          accepting: String(row["accepting"] || "").trim(),
          specialty: [],
          addresses: [],
          networks: [],
          year: ["2027"],
        },
      ],
    };
  }

  // Update all three plans
  providers[npi].plans.forEach((plan) => {
    // Add specialty
    if (
      specialty &&
      !plan.specialty.includes(specialty)
    ) {
      plan.specialty.push(specialty);
    }

    // Add network
    if (
      networkId &&
      !plan.networks.includes(networkId)
    ) {
      plan.networks.push(networkId);
    }

    // Add address
    const addressExists = plan.addresses.some(
      (a) =>
        a.address === address.address &&
        a.address_2 === address.address_2 &&
        a.city === address.city &&
        a.state === address.state &&
        a.zip === address.zip &&
        a.phone === address.phone
    );

    if (!addressExists && address.address) {
      plan.addresses.push(address);
    }
  });
});
  const result = Object.values(providers);
  const outputFile = path.join("jsonfiles", `${uuid()}.json`);

  await fs.ensureDir("jsonfiles");
  await fs.writeJson(outputFile, result, {
    spaces: 2,
  });

  return outputFile;
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
};
