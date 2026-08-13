const {
  buildAddress,
  buildTelecom,
  sanitizeId,
} = require("../../utils/fhir.utils");

const mapLocation = (
  provider,
  address,
  index,
  organizationId = null
) => {
  const npi = String(provider?.npi || "").trim();

  if (!npi) {
    throw new Error("Cannot create Location: NPI is missing");
  }

  const locationIndex = Number(index) + 1;

  const locationId = sanitizeId(
    `location-${npi}-${locationIndex}`
  );

  const providerName =
    `${provider?.name?.first || ""} ${provider?.name?.last || ""}`
      .trim();

  const locationName =
    provider?.facilityName ||
    providerName ||
    `Provider Location ${locationIndex}`;

  const resource = {
    resourceType: "Location",

    id: locationId,

    identifier: [
      {
        system: "urn:provider-directory:location",
        value: `${npi}-${locationIndex}`,
      },
    ],

    status: "active",

    name: locationName,

    mode: "instance",

    type: [
      {
        text: provider?.type || "Provider",
      },
    ],

    address: buildAddress(address),

    telecom: buildTelecom(
      address?.phone || null,
      null
    ),
  };

  if (organizationId) {
    resource.managingOrganization = {
      reference: `Organization/${organizationId}`,
    };
  }

  return resource;
};

module.exports = mapLocation;