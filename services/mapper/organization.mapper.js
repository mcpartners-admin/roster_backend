const { buildIdentifier, buildAddress, sanitizeId } = require("../../utils/fhir.utils");

const mapOrganization = (provider, address) => {
  const facilityName = provider?.facilityName || "Provider Organization";
  const organizationId = `organization-${provider.organizationId}`;

  return {
    resourceType: "Organization",
    id: organizationId,
    identifier: [
      ...buildIdentifier("urn:provider-directory:provider", provider?.npi),
      ...buildIdentifier("urn:provider-directory:organization-name", facilityName),
    ],
    active: true,
    type: [{ text: provider?.type || "Provider" }],
    name: facilityName,
    address: buildAddress(address) ? [buildAddress(address)] : [],
  };
};

module.exports = mapOrganization;
