const {
  buildIdentifier,
  buildAddress,
  sanitizeId,
} = require("../../utils/fhir.utils");

const mapOrganization = (provider, address) => {
  const npi = String(provider?.npi || "").trim();

  if (!npi) {
    throw new Error("Cannot create Organization: NPI is missing");
  }

  const organizationId = sanitizeId(
    `organization-${npi}`
  );

  const facilityName =
    provider?.facilityName ||
    `${provider?.name?.first || ""} ${provider?.name?.last || ""}`
      .trim() ||
    `Provider Organization ${npi}`;

  const resource = {
    resourceType: "Organization",

    id: organizationId,

    active: true,

    identifier: [
      ...buildIdentifier(
        "urn:provider-directory:provider",
        npi
      ),

      ...buildIdentifier(
        "urn:provider-directory:organization-name",
        facilityName
      ),
    ],

    type: [
      {
        text: provider?.type || "Provider",
      },
    ],

    name: facilityName,

    address: [],
  };

  if (address) {
    const builtAddress = buildAddress(address);

    if (builtAddress) {
      resource.address.push(builtAddress);
    }
  }

  return resource;
};

module.exports = mapOrganization;