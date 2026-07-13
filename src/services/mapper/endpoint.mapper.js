const { buildTelecom, sanitizeId } = require("../../utils/fhir.utils");

const mapEndpoint = (provider, address, index) => {
  const endpointId = sanitizeId(`${provider?.npi}-endpoint-${index + 1}`);

  return {
    resourceType: "Endpoint",
    id: endpointId,
    status: "active",
    connectionType: {
      system: "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
      code: "direct-project",
      display: "Direct Project",
    },
    name: `${provider?.facilityName || "Provider"} Endpoint`,
    managingOrganization: provider?.facilityName ? { display: provider.facilityName } : undefined,
    address: address?.address || undefined,
    payloadType: [{ text: "urn:provider-directory:provider" }],
    payloadMimeType: ["application/fhir+json"],
    telecom: buildTelecom(address?.phone || null, null),
  };
};

module.exports = mapEndpoint;
