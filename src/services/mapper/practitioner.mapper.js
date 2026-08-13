const {
  buildHumanName,
  buildIdentifier,
  buildTelecom,
  sanitizeId,
} = require("../../utils/fhir.utils");

const mapPractitioner = (provider) => {
  const npi = String(provider?.npi || "").trim();

  if (!npi) {
    throw new Error("Cannot create Practitioner: NPI is missing");
  }

  const practitionerId = sanitizeId(`practitioner-${npi}`);
  const humanName = buildHumanName(provider);

  const resource = {
    resourceType: "Practitioner",
    id: practitionerId,
    active: true,

    identifier: [
      ...buildIdentifier(
        "http://hl7.org/fhir/sid/us-npi",
        npi
      ),
    ],

    name: humanName ? [humanName] : [],

    communication: (provider?.languages || [])
      .filter(Boolean)
      .map((language) => ({
        language: {
          text: String(language),
        },
      })),
  };

  // Only add gender when valid/present
  if (provider?.sex) {
    const gender = String(provider.sex).toLowerCase();

    if (["male", "female", "other", "unknown"].includes(gender)) {
      resource.gender = gender;
    }
  }

  return resource;
};

module.exports = mapPractitioner;