const { sanitizeId } = require("../../utils/fhir.utils");

const mapHealthcareService = (
  provider,
  plan,
  index
) => {
  const npi = String(provider?.npi || "").trim();
  const maPlanId = String(plan?.maPlanId || "").trim();

  if (!npi) {
    throw new Error(
      "Cannot create HealthcareService: NPI is missing"
    );
  }

  const serviceId = sanitizeId(
    `service-${npi}-${maPlanId || index + 1}`
  );

  const providerName =
    `${provider?.name?.first || ""} ${provider?.name?.last || ""}`
      .trim();

  const resource = {
    resourceType: "HealthcareService",

    id: serviceId,

    active: true,

    category: [
      {
        text: provider?.type || "Provider",
      },
    ],

    type: (plan?.specialty || [])
      .filter(Boolean)
      .map((specialty) => ({
        text: String(specialty),
      })),

    name:
      provider?.facilityName ||
      providerName ||
      "Healthcare Service",
  };

  if (provider?.facilityName) {
    resource.providedBy = {
      reference: `Organization/${sanitizeId(
        `organization-${npi}`
      )}`,
    };
  }

  if (plan?.accepting) {
    resource.comment = String(plan.accepting);
  }

  return resource;
};

module.exports = mapHealthcareService;