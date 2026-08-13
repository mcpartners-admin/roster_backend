const { sanitizeId } = require("../../utils/fhir.utils");

const mapNetwork = (network, managingOrganizationId = null) => {
  if (!network?.id) {
    throw new Error("Cannot create Network: network ID is missing");
  }

  const networkId = sanitizeId(
    `network-${network.id}`
  );

  const resource = {
    resourceType: "Organization",

    id: networkId,

    active: true,

    name:
      network?.name ||
      `Provider Network ${network.id}`,

    type: [
      {
        coding: [
          {
            system:
              "http://hl7.org/fhir/us/davinci-pdex-plan-net/CodeSystem/OrgTypeCS",
            code: "network",
            display: "Network",
          },
        ],
      },
    ],
  };

  if (managingOrganizationId) {
    resource.partOf = {
      reference:
        `Organization/${managingOrganizationId}`,
    };
  }

  return resource;
};

module.exports = mapNetwork;