const {
  sanitizeId,
  buildTelecom,
} = require("../../utils/fhir.utils");

const NETWORK_REFERENCE_URL =
  "http://hl7.org/fhir/us/davinci-pdex-plan-net/StructureDefinition/network-reference";

const mapPractitionerRole = (
  provider,
  {
    practitionerId,
    organizationId = null,
    locationIds = [],
    healthcareServiceIds = [],
    endpointIds = [],
    networkIds = [],
    plan = null,
  } = {}
) => {
  const npi = String(provider?.npi || "").trim();

  if (!npi) {
    throw new Error(
      "Cannot create PractitionerRole: NPI is missing"
    );
  }

  if (!practitionerId) {
    throw new Error(
      `Cannot create PractitionerRole for NPI ${npi}: practitionerId is missing`
    );
  }

  const roleId = sanitizeId(
    `role-${npi}`
  );

  const selectedPlan =
    plan ||
    provider?.plans?.[0] ||
    {};

  const resource = {
    resourceType: "PractitionerRole",

    id: roleId,

    active: true,

    practitioner: {
      reference:
        `Practitioner/${practitionerId}`,
    },

    location: (locationIds || [])
      .filter(Boolean)
      .map((locationId) => ({
        reference:
          `Location/${locationId}`,
      })),

    healthcareService: (healthcareServiceIds || [])
      .filter(Boolean)
      .map((serviceId) => ({
        reference:
          `HealthcareService/${serviceId}`,
      })),

    specialty: (selectedPlan?.specialty || [])
      .filter(Boolean)
      .map((specialty) => ({
        text: String(specialty),
      })),

    telecom: buildTelecom(
      selectedPlan?.addresses?.[0]?.phone || null,
      null
    ),
  };

  /*
   * Provider organization.
   */
  if (organizationId) {
    resource.organization = {
      reference:
        `Organization/${organizationId}`,
    };
  }

  /*
   * Network references.
   *
   * Plan-Net represents the network relationship
   * through the network-reference extension.
   */
  const validNetworkIds = (networkIds || [])
    .filter(Boolean);

  if (validNetworkIds.length > 0) {
    resource.extension = validNetworkIds.map(
      (networkId) => ({
        url: NETWORK_REFERENCE_URL,

        valueReference: {
          reference:
            `Organization/${networkId}`,
        },
      })
    );
  }

  /*
   * Endpoint references.
   */
  const validEndpointIds = (endpointIds || [])
    .filter(Boolean);

  if (validEndpointIds.length > 0) {
    resource.endpoint = validEndpointIds.map(
      (endpointId) => ({
        reference:
          `Endpoint/${endpointId}`,
      })
    );
  }

  return resource;
};

module.exports = mapPractitionerRole;