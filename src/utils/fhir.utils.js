const sanitizeId = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "resource";
};

const buildIdentifier = (system, value) => {
  if (!value) {
    return [];
  }

  return [
    {
      system,
      value: String(value),
    },
  ];
};

const buildTelecom = (phone, email) => {
  const telecom = [];

  if (phone) {
    telecom.push({ system: "phone", value: String(phone) });
  }

  if (email) {
    telecom.push({ system: "email", value: String(email) });
  }

  return telecom;
};

const buildHumanName = (provider) => {
  const name = provider?.name || {};
  const family = [name.last].filter(Boolean).join(" ");
  const given = [name.first, name.middle].filter(Boolean);

  if (!family && given.length === 0) {
    return null;
  }

  return {
    use: "official",
    family,
    given,
    prefix: name.prefix ? [String(name.prefix)] : undefined,
    suffix: name.suffix ? [String(name.suffix)] : undefined,
  };
};

const buildAddress = (address) => {
  if (!address) {
    return undefined;
  }

  return {
    use: "work",
    line: [address.address, address.address2].filter(Boolean),
    city: address.city || "",
    state: address.state || "",
    postalCode: address.zip || "",
    country: "US",
  };
};

module.exports = {
  sanitizeId,
  buildIdentifier,
  buildTelecom,
  buildHumanName,
  buildAddress,
};
