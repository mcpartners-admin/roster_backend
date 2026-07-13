const { buildAddress, buildTelecom, sanitizeId } = require("../../utils/fhir.utils");

const mapLocation = (provider, address, index, organizationId) => {
  const locationId =  `location-${provider.npi}-${index + 1}`;;

  return {
    resourceType: "Location",
    id: locationId,
    identifier: [
      {
        system: "urn:provider-directory:location",
        value: `${provider.npi}-${index + 1}`,
      },
    ],
    status: "active",
    name: provider?.facilityName || `${provider?.name?.first || ""} ${provider?.name?.last || ""}`.trim() || "Provider Location",
    mode: "instance",
    type: [{ text: provider?.type || "Provider" }],
    telecom: buildTelecom(address?.phone || null, null),
    address: buildAddress(address),
    managingOrganization: organizationId ? { reference: `Organization/${organizationId}` } : undefined,
  };
};

module.exports = mapLocation;
