const axios = require("axios");

const getClient = () => {
  const baseURL = process.env.HAPI_BASE_URL;

  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json",
    },
    timeout: 120000,
  });
};

const upsertResource = async (resource, retries = 3) => {
  if (!resource || !resource.resourceType || !resource.id) {
    throw new Error("Resource is missing resourceType or id");
  }

  const client = getClient();
  const url = `/${resource.resourceType}/${resource.id}`;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await client.put(url, resource);
      return { success: true, resourceType: resource.resourceType, id: resource.id };
    } catch (error) {
      const message = error?.response?.data?.issue?.[0]?.diagnostics || error.message;
      if (attempt === retries) {
        throw new Error(`Failed to upload ${resource.resourceType}/${resource.id}: ${message}`);
      }

      console.warn(`Retrying ${resource.resourceType}/${resource.id} (${attempt}/${retries}) due to: ${message}`);
    }
  }

  return { success: false };
};

module.exports = {
  upsertResource,
};
