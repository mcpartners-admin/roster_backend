const {
  buildTelecom,
  sanitizeId,
} = require("../../utils/fhir.utils");

const mapEndpoint = (
  provider,
  address,
  index,
  organizationId = null
) => {
  const npi = String(provider?.npi || "").trim();

  if (!npi) {
    throw new Error(
      "Cannot create Endpoint: NPI is missing"
    );
  }

  const endpointIndex = Number(index) + 1;

  const endpointId = sanitizeId(
    `${npi}-endpoint-${endpointIndex}`
  );

  const resource = {
    resourceType: "Endpoint",

    id: endpointId,

    status: "active",

    connectionType: {
      system:
        "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",

      code: "direct-project",

      display: "Direct Project",
    },

    name:
      `${provider?.facilityName || "Provider"} Endpoint ${endpointIndex}`,

    address:
      address?.address || undefined,

    payloadType: [
      {
        text: "FHIR",
      },
    ],

    payloadMimeType: [
      "application/fhir+json",
    ],

    telecom: buildTelecom(
      address?.phone || null,
      null
    ),
  };

  if (organizationId) {
    resource.managingOrganization = {
      reference:
        `Organization/${organizationId}`,
    };
  }

  return resource;
};

module.exports = mapEndpoint;