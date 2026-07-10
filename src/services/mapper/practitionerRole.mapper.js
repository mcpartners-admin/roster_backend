const { sanitizeId, buildTelecom } = require("../../utils/fhir.utils");

const mapPractitionerRole = (
  provider,
  practitionerId,
  organizationId,
  locationIds = [],
  healthcareServiceIds = [],
  endpointIds = []
) => {
  const roleId = sanitizeId(`${provider?.npi || "provider"}-${organizationId || "role"}`);
  const plan = provider?.plans?.[0] || {};

  return {
    resourceType: "PractitionerRole",
    id: roleId,
    active: true,
    practitioner: { reference: `Practitioner/${practitionerId}` },
    organization: organizationId ? { reference: `Organization/${organizationId}` } : undefined,
    location: locationIds.map((locationId) => ({ reference: `Location/${locationId}` })),
    healthcareService: healthcareServiceIds.map((serviceId) => ({ reference: `HealthcareService/${serviceId}` })),
    code: [{ text: provider?.type || "Provider" }],
    specialty: (plan?.specialty || [])
      .filter(Boolean)
      .map((specialty) => ({ text: specialty })),
    telecom: buildTelecom(plan?.addresses?.[0]?.phone || null, null),
    endpoint: endpointIds.map((endpointId) => ({ reference: `Endpoint/${endpointId}` })),
  };
};

module.exports = mapPractitionerRole;
