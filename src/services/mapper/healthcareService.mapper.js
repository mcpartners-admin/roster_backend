const { sanitizeId } = require("../../utils/fhir.utils");

const mapHealthcareService = (provider, plan, index) => {
  const serviceId = `service-${provide.npi}`;

  return {
    resourceType: "HealthcareService",
    id: serviceId,
    active: true,
    providedBy: provider?.facilityName ? { display: provider.facilityName } : undefined,
    category: [{ text: provider?.type || "Provider" }],
    type: (plan?.specialty || [])
      .filter(Boolean)
      .map((specialty) => ({ text: specialty })),
    name: provider?.facilityName || `${provider?.name?.first || ""} ${provider?.name?.last || ""}`.trim() || "Healthcare Service",
    comment: plan?.accepting || undefined,
  };
};

module.exports = mapHealthcareService;
