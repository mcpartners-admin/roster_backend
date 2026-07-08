const { buildHumanName, buildIdentifier, buildTelecom, sanitizeId } = require("../../utils/fhir.utils");

const mapPractitioner = (provider) => {
  const npi = provider?.npi;
 const practitionerId = `practitioner-${provider.npi}`;
  const humanName = buildHumanName(provider);

  return {
    resourceType: "Practitioner",
    id: practitionerId,
    identifier: buildIdentifier("http://hl7.org/fhir/sid/us-npi", npi),
    active: true,
    name: humanName ? [humanName] : [],
    telecom: buildTelecom(null, null),
    communication: (provider?.languages || [])
      .filter(Boolean)
      .map((language) => ({ language: { text: language } })),
  };
};

module.exports = mapPractitioner;
