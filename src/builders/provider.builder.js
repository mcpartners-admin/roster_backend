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
  const specialtyCode = formatSpecialtyCode(
    normalizedRow.specialty?.[0] || ""
  );

  const address = {
    address: normalizedRow.address || "",
    address2: normalizedRow.address2 || "",
    city: normalizedRow.city || "",
    state: normalizedRow.state || "",
    zip: normalizedRow.zip || "",
    phone: normalizedRow.phone || "",
  };

  return {
    maPlanId: planId,
    accepting: normalizedRow.accepting,
    specialty: new Set(specialtyCode ? [specialtyCode] : []),
    addresses: new Set(address.address ? [JSON.stringify(address)] : []),
    networks: new Set(
      normalizedRow.network ? [normalizedRow.network] : []
    ),
    year: normalizedRow.year,
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
      new Date().toISOString().split("T")[0],
    plans: DEFAULT_PLAN_IDS.map((planId) =>
      createPlan(planId, normalizedRow)
    ),
  };
}

function createFacility(normalizedRow) {
  const specialtyCode = formatSpecialtyCode(
    normalizedRow.specialty?.[0] || ""
  );

  return {
    npi: normalizedRow.npi,
    type: "Facility",
    // CMS required fields
    facilityName: normalizedRow.facilityName || "",
    facilityType: [...new Set(normalizedRow.facilityType || [])],
    lastUpdatedOn: new Date().toISOString().split("T")[0],
    // Each facility contains only one specialty
    plans: DEFAULT_PLAN_IDS.map((planId) =>
      createPlan(planId, {
        ...normalizedRow,
        specialty: [specialtyCode],
      })
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

function mergeNormalizedRowIntoFacility(facility, normalizedRow) {
  let hasChanges = false;
  console.log("hell",facility)
  // Merge facility taxonomy codes
  if (Array.isArray(normalizedRow.facilityType)) {
    normalizedRow.facilityType.forEach((code) => {
      const formattedCode = formatSpecialtyCode(code);

      if (
        formattedCode &&
        !facility.facilityType.includes(formattedCode)
      ) {
        facility.facilityType.push(formattedCode);
        hasChanges = true;
      }
    });
  }

  facility.plans.forEach((plan) => {
    // Network
    if (
      normalizedRow.network &&
      !plan.networks.has(normalizedRow.network)
    ) {
      plan.networks.add(normalizedRow.network);
      hasChanges = true;
    }

    // Address
    const address = {
      address: normalizedRow.address || "",
      address2: normalizedRow.address2 || "",
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
function finalizeFacility(facility) {
  return {
    npi: facility.npi,
    type: facility.type,
    facilityName: facility.facilityName,
    facilityType: facility.facilityType,
    lastUpdatedOn: new Date().toISOString().split("T")[0],

    plans: facility.plans.map((plan) => ({
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

function finalizeProvider(provider) {
  return {
    npi: provider.npi,
    type: provider.type,
    name: provider.name,
    sex: provider.sex,
    languages: provider.languages,
    lastUpdatedOn: new Date().toISOString().split("T")[0],
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
  createFacility,
  mergeNormalizedRowIntoProvider,
  finalizeProvider,
  finalizeFacility,
  mergeNormalizedRowIntoFacility
};