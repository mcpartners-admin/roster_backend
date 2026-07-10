const fs = require("fs-extra");
const path = require("path");
const Provider = require("../schemas/provider.schema");
const { convertExcelToCmsJson } = require("../converter/cms.converter");

const getProvidersByRoster = async (rosterName) => {
  return Provider.find({ rosterName }).lean();
};

const convertExcelToJson = async (filePath) => {
  const result = await convertExcelToCmsJson(filePath);
  return result.summary;
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
