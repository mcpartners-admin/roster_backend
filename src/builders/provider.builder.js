const {
  DEFAULT_PLAN_IDS,
  DEFAULT_YEAR,
} = require("../config/cms.config");

function formatSpecialtyCode(code) {
  if (code === null || code === undefined || code === "") {
    return null;
  }

  const text = String(code).trim();

  if (!/^\d+$/.test(text)) {
    return text;
  }

  if (text.length === 1) {
    return `00${text}`;
  }

  if (text.length === 2) {
    return `0${text}`;
  }

  return text;
}

function createPlan(planId, normalizedRow) {
  return {
    maPlanId: planId,
    accepting: normalizedRow.accepting ?? null,
    specialty: new Set(),
    addresses: new Set(),
    networks: new Set(),
    year:
      Array.isArray(normalizedRow.year) && normalizedRow.year.length
        ? [...normalizedRow.year]
        : normalizedRow.year !== undefined && normalizedRow.year !== null && normalizedRow.year !== ""
          ? [normalizedRow.year]
          : [...DEFAULT_YEAR],
  };
}

function createProvider(normalizedRow) {
  return {
    npi: normalizedRow.npi,
    type: normalizedRow.type,
    name: {
      prefix: normalizedRow.prefix || "",
      first: normalizedRow.firstName || "",
      middle: normalizedRow.middleName || "",
      last: normalizedRow.lastName || "",
      suffix: normalizedRow.suffix || "",
    },
    sex: normalizedRow.sex || null,
    languages: [...new Set(normalizedRow.languages || [])],
    lastUpdatedOn:
      normalizedRow.lastUpdatedOn ||
      new Date().toISOString().split("T")[0],
    plans: DEFAULT_PLAN_IDS.map((planId) =>
      createPlan(planId, normalizedRow)
    ),
  };
}

function mergeNormalizedRowIntoProvider(provider, normalizedRow) {
  let hasChanges = false;

  provider.plans.forEach((plan) => {
    // Specialty
    if (Array.isArray(normalizedRow.specialty)) {
      normalizedRow.specialty.forEach((code) => {
        const formattedCode = formatSpecialtyCode(code);

        if (formattedCode && !plan.specialty.has(formattedCode)) {
          plan.specialty.add(formattedCode);
          hasChanges = true;
        }
      });
    }

    // Network
    if (normalizedRow.network && !plan.networks.has(normalizedRow.network)) {
      plan.networks.add(normalizedRow.network);
      hasChanges = true;
    }

    // Address
    const address = {
      address: normalizedRow.address || "",
      address_2: normalizedRow.address2 || "",
      city: normalizedRow.city || "",
      state: normalizedRow.state || "",
      zip: normalizedRow.zip || "",
      phone: normalizedRow.phone || "",
    };

    const addressKey = JSON.stringify(address);

    if (address.address && !plan.addresses.has(addressKey)) {
      plan.addresses.add(addressKey);
      hasChanges = true;
    }
  });

  return hasChanges;
}

function finalizeProvider(provider) {
  return {
    npi: provider.npi,
    type: provider.type,
    name: provider.name,
    sex: provider.sex,
    languages: provider.languages,
    lastUpdatedOn: provider.lastUpdatedOn,
    plans: provider.plans.map((plan) => ({
      maPlanId: plan.maPlanId,
      accepting: plan.accepting,
      specialty: [...plan.specialty],
      addresses: [...plan.addresses].map((address) =>
        JSON.parse(address)
      ),
      networks: [...plan.networks],
      year: plan.year,
    })),
  };
}

module.exports = {
  createProvider,
  mergeNormalizedRowIntoProvider,
  finalizeProvider,
};