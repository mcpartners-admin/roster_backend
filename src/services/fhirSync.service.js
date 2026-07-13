const Provider = require("../schemas/provider.schema");
const hapiService = require("./hapi.service");
const mappers = require("./mapper");

const DEFAULT_BATCH_SIZE = parseInt(process.env.SYNC_BATCH_SIZE || "100", 10);

const getBatchSize = (requestedBatchSize) => {
  const parsed = parseInt(requestedBatchSize || DEFAULT_BATCH_SIZE, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BATCH_SIZE;
};

const syncFhir = async (options = {}) => {
  const batchSize = getBatchSize(options.batchSize);
  const page = parseInt(options.page, 10);
  const pageSize = parseInt(options.pageSize, 10) || batchSize;
  const stats = {
    organizations: 0,
    practitioners: 0,
    locations: 0,
    insurancePlans: 0,
    errors: 0,
    providersProcessed: 0,
    durationMs: 0,
  };

  const startedAt = Date.now();

  try {
    const query = {};
    let providers = [];

    if (Number.isInteger(page) && page > 0) {
      providers = await Provider.find(query).lean().skip((page - 1) * pageSize).limit(pageSize);
      stats.providersProcessed = providers.length;
    } else {
      const total = await Provider.countDocuments(query);
      stats.providersProcessed = total;

      const cursor = Provider.find(query).lean().cursor({ batchSize });

      for await (const provider of cursor) {
        providers.push(provider);

        if (providers.length >= batchSize) {
          await processBatch(providers, stats, total, batchSize);
          providers = [];
        }
      }

      if (providers.length > 0) {
        await processBatch(providers, stats, total, batchSize);
      }
    }

    if (Number.isInteger(page) && page > 0) {
      await processBatch(providers, stats, providers.length, batchSize);
    }
  } catch (error) {
    console.error("FHIR sync failed at service level:", error);
    throw error;
  } finally {
    stats.durationMs = Date.now() - startedAt;
  }

  return stats;
};

const processBatch = async (providers, stats, total, batchSize) => {
  for (const provider of providers) {
    try {
      await uploadProviderResources(provider, stats, total, stats.providersProcessed);
      stats.providersProcessed += 0;
    } catch (error) {
      stats.errors += 1;
      console.error(`Failed to sync provider ${provider?.npi || provider?._id}:`, error.message);
    }
  }

  console.log(`Processed ${Math.min(stats.providersProcessed, total)} provider records in batch of ${batchSize}`);
};

const uploadProviderResources = async (provider, stats, total, processed) => {
  const practitionerResource = mappers.practitioner(provider);
  console.log("practitionerResource",practitionerResource)
  await hapiService.upsertResource(practitionerResource);
  stats.practitioners += 1;
  console.log(`Uploading Practitioner ${stats.practitioners}/${total}`);

  const organizationResource = mappers.organization(provider, provider?.plans?.[0]?.addresses?.[0]);
  await hapiService.upsertResource(organizationResource);
  stats.organizations += 1;
  console.log(`Uploading Organization ${stats.organizations}/${total}`);

  const locationIds = [];
  const healthcareServiceIds = [];
  const endpointIds = [];

  const planArray = Array.isArray(provider?.plans) ? provider.plans : [];

  for (let index = 0; index < planArray.length; index += 1) {
    const plan = planArray[index] || {};
    const addresses = Array.isArray(plan.addresses) ? plan.addresses : [];

    for (let addressIndex = 0; addressIndex < addresses.length; addressIndex += 1) {
      const address = addresses[addressIndex];
      const locationResource = mappers.location(provider, address, addressIndex, organizationResource.id);
      console.log("locationResource",locationResource);
      await hapiService.upsertResource(locationResource);
      stats.locations += 1;
      locationIds.push(locationResource.id);
      console.log(`Uploading Location ${stats.locations}/${total}`);

      const healthcareServiceResource = mappers.healthcareService(provider, plan, addressIndex);
      await hapiService.upsertResource(healthcareServiceResource);
      stats.locations += 0;
      healthcareServiceIds.push(healthcareServiceResource.id);
      console.log(`Uploading HealthcareService ${healthcareServiceIds.length}/${total}`);

      const endpointResource = mappers.endpoint(provider, address, addressIndex);
      await hapiService.upsertResource(endpointResource);
      endpointIds.push(endpointResource.id);
      console.log(`Uploading Endpoint ${endpointIds.length}/${total}`);
    }

    const insurancePlanResource = mappers.insurancePlan(provider, plan, index);
    await hapiService.upsertResource(insurancePlanResource);
    stats.insurancePlans += 1;
    console.log(`Uploading InsurancePlan ${stats.insurancePlans}/${total}`);
  }

  const practitionerRoleResource = mappers.practitionerRole(
    provider,
    practitionerResource.id,
    organizationResource.id,
    locationIds,
    healthcareServiceIds,
    endpointIds
  );
  await hapiService.upsertResource(practitionerRoleResource);
  console.log(`Completed provider ${provider?.npi || provider?._id}`);
};

module.exports = {
  syncFhir,
};
