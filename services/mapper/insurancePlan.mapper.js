const { buildIdentifier, sanitizeId } = require("../../utils/fhir.utils");

const mapInsurancePlan = (provider, plan, index) => {
  const planId = `plan-${provider.planId}`;

  return {
    resourceType: "InsurancePlan",
    id: planId,
    identifier: [
      ...buildIdentifier("urn:provider-directory:plan-id", plan?.maPlanId),
      ...buildIdentifier("urn:provider-directory:plan-network", (plan?.networkId || [])[0]),
    ],
    name: plan?.maPlanId || `Plan ${index + 1}`,
    status: "active",
    type: [{ text: plan?.maPlanId || "Plan" }],
    alias: [plan?.maPlanId || "Plan"].filter(Boolean),
  };
};

module.exports = mapInsurancePlan;
