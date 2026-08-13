const {
  buildIdentifier,
  sanitizeId,
} = require("../../utils/fhir.utils");

const mapInsurancePlan = (
  provider,
  plan,
  index
) => {
  const maPlanId = String(
    plan?.maPlanId || ""
  ).trim();

  if (!maPlanId) {
    throw new Error(
      `Cannot create InsurancePlan: MA Plan ID missing for NPI ${provider?.npi}`
    );
  }

  const planId = sanitizeId(
    `plan-${maPlanId}`
  );

  const resource = {
    resourceType: "InsurancePlan",

    id: planId,

    identifier: [
      ...buildIdentifier(
        "urn:provider-directory:plan-id",
        maPlanId
      ),
    ],

    name: maPlanId,

    status: "active",

    type: [
      {
        text: "Medicare Advantage",
      },
    ],

    alias: [maPlanId],
  };

  return resource;
};

module.exports = mapInsurancePlan;