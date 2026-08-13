// const Provider = require("../schemas/provider.schema");
// const hapiService = require("./hapi.service");
// const mappers = require("./mapper");

// const DEFAULT_BATCH_SIZE = parseInt(process.env.SYNC_BATCH_SIZE || "100", 10);

// const getBatchSize = (requestedBatchSize) => {
//   const parsed = parseInt(requestedBatchSize || DEFAULT_BATCH_SIZE, 10);
//   return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BATCH_SIZE;
// };

// const syncFhir = async (options = {}) => {
//   const batchSize = getBatchSize(options.batchSize);
//   const page = parseInt(options.page, 10);
//   const pageSize = parseInt(options.pageSize, 10) || batchSize;
//   const stats = {
//     organizations: 0,
//     practitioners: 0,
//     locations: 0,
//     insurancePlans: 0,
//     errors: 0,
//     providersProcessed: 0,
//     durationMs: 0,
//   };
//   const startedAt = Date.now();
//   try {
//     const query = {};
//     let providers = [];

//     if (Number.isInteger(page) && page > 0) {
//       providers = await Provider.find(query).lean().skip((page - 1) * pageSize).limit(pageSize);
//       stats.providersProcessed = providers.length;
//     } else {
//       const total = await Provider.countDocuments(query);
//       stats.providersProcessed = total;
//       const cursor = Provider.find(query).lean().cursor({ batchSize });
//       for await (const provider of cursor) {
//         providers.push(provider);

//         if (providers.length >= batchSize) {
//           await processBatch(providers, stats, total, batchSize);
//           providers = [];
//         }
//       }

//       if (providers.length > 0) {
//         await processBatch(providers, stats, total, batchSize);
//       }
//     }

//     if (Number.isInteger(page) && page > 0) {
//       await processBatch(providers, stats, providers.length, batchSize);
//     }
//   } catch (error) {
//     console.error("FHIR sync failed at service level:", error);
//     throw error;
//   } finally {
//     stats.durationMs = Date.now() - startedAt;
//   }

//   return stats;
// };

// const processBatch = async (providers, stats, total, batchSize) => {
//   for (const provider of providers) {
//     try {
//       await uploadProviderResources(provider, stats, total, stats.providersProcessed);
//       stats.providersProcessed += 0;
//     } catch (error) {
//       stats.errors += 1;
//       console.error(`Failed to sync provider ${provider?.npi || provider?._id}:`, error.message);
//     }
//   }

//   console.log(`Processed ${Math.min(stats.providersProcessed, total)} provider records in batch of ${batchSize}`);
// };

// const uploadProviderResources = async (provider, stats, total) => {
//   const isFacility = provider.type === "FACILITY";

//   let practitionerResource = null;
//   let organizationResource = null;

//   // Individual Provider
//   if (!isFacility) {
//     practitionerResource = mappers.practitioner(provider);
//     await hapiService.upsertResource(practitionerResource);
//     stats.practitioners += 1;
//     console.log(`Uploading Practitioner ${stats.practitioners}/${total}`);
//   }

//   // Facility
//   if (isFacility) {
//     organizationResource = mappers.organization(
//       provider,
//       provider?.plans?.[0]?.addresses?.[0]
//     );
//     await hapiService.upsertResource(organizationResource);
//     stats.organizations += 1;
//     console.log(`Uploading Organization ${stats.organizations}/${total}`);
//   }

//   const locationIds = [];
//   const healthcareServiceIds = [];
//   const endpointIds = [];
//   const plans = Array.isArray(provider.plans)
//     ? provider.plans
//     : [];

//   for (let planIndex = 0; planIndex < plans.length; planIndex++) {
//     const plan = plans[planIndex];
//     const addresses = Array.isArray(plan.addresses)
//       ? plan.addresses
//       : [];
//     for (
//       let addressIndex = 0;
//       addressIndex < addresses.length;
//       addressIndex++
//     ) {
//       const address = addresses[addressIndex];

//       // Location
//       const locationResource = mappers.location(
//         provider,
//         address,
//         addressIndex,
//         organizationResource?.id
//       );
//       await hapiService.upsertResource(locationResource);
//       locationIds.push(locationResource.id);
//       stats.locations++;
//       console.log(
//         `Uploading Location ${stats.locations}/${total}`
//       );

//       // HealthcareService
//       const healthcareServiceResource =
//         mappers.healthcareService(
//           provider,
//           plan,
//           addressIndex
//         );

//       await hapiService.upsertResource(
//         healthcareServiceResource
//       );
//       healthcareServiceIds.push(
//         healthcareServiceResource.id
//       );
//       stats.healthcareServices++;
//       console.log(
//         `Uploading HealthcareService ${stats.healthcareServices}/${total}`
//       );

//       // Endpoint
//       const endpointResource =
//         mappers.endpoint(
//           provider,
//           address,
//           addressIndex
//         );

//       await hapiService.upsertResource(
//         endpointResource
//       );
//       endpointIds.push(endpointResource.id);
//       stats.endpoints++;
//       console.log(
//         `Uploading Endpoint ${stats.endpoints}/${total}`
//       );
//     }

//     // InsurancePlan
//     const insurancePlanResource =
//       mappers.insurancePlan(
//         provider,
//         plan,
//         planIndex
//       );

//     await hapiService.upsertResource(
//       insurancePlanResource
//     );
//     stats.insurancePlans++;
//     console.log(
//       `Uploading InsurancePlan ${stats.insurancePlans}/${total}`
//     );
//   }

//   // PractitionerRole only for Individual Providers
//   if (!isFacility) {
//     const practitionerRoleResource =
//       mappers.practitionerRole(
//         provider,
//         practitionerResource.id,
//         organizationResource?.id,
//         locationIds,
//         healthcareServiceIds,
//         endpointIds
//       );

//     await hapiService.upsertResource(
//       practitionerRoleResource
//     );
//     stats.practitionerRoles++;
//     console.log(
//       `Uploading PractitionerRole ${stats.practitionerRoles}/${total}`
//     );
//   }
//   console.log(
//     `Completed ${provider.type} ${provider.npi}`
//   );
// };

// module.exports = {
//   syncFhir,
// };


const Provider = require("../schemas/provider.schema");
const hapiService = require("./hapi.service");
const mappers = require("./mapper");

const DEFAULT_BATCH_SIZE = parseInt(
  process.env.SYNC_BATCH_SIZE || "100",
  10
);

const getBatchSize = (requestedBatchSize) => {
  const parsed = parseInt(
    requestedBatchSize || DEFAULT_BATCH_SIZE,
    10
  );

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_BATCH_SIZE;
};

const syncFhir = async (options = {}) => {
  const batchSize = getBatchSize(options.batchSize);

  const page = parseInt(options.page, 10);
  const pageSize =
    parseInt(options.pageSize, 10) || batchSize;

  const stats = {
    organizations: 0,
    practitioners: 0,
    locations: 0,
    healthcareServices: 0,
    insurancePlans: 0,
    endpoints: 0,
    practitionerRoles: 0,
    errors: 0,
    providersProcessed: 0,
    durationMs: 0,
  };

  const startedAt = Date.now();

  try {
    const query = {};
    let providers = [];

    /*
     * PAGE MODE
     */
    if (Number.isInteger(page) && page > 0) {
      providers = await Provider.find(query)
        .lean()
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      await processBatch(
        providers,
        stats,
        providers.length,
        batchSize
      );

      stats.providersProcessed = providers.length;
    }

    /*
     * CURSOR / FULL SYNC MODE
     */
    else {
     const total = await Provider.countDocuments(query);

stats.providersProcessed = 0;

const PAGE_SIZE = batchSize;
let lastId = null;

while (true) {
  const pageQuery = lastId
    ? { ...query, _id: { $gt: lastId } }
    : query;

  const providers = await Provider.find(pageQuery)
    .sort({ _id: 1 })
    .limit(PAGE_SIZE)
    .lean();

  if (providers.length === 0) {
    break;
  }

  await processBatch(
    providers,
    stats,
    total,
    PAGE_SIZE
  );

  stats.providersProcessed += providers.length;

  console.log(
    `FHIR sync progress: ${stats.providersProcessed}/${total}`
  );

  lastId = providers[providers.length - 1]._id;
}
    }
  } catch (error) {
    console.error(
      "FHIR sync failed at service level:",
      error
    );

    throw error;
  } finally {
    stats.durationMs = Date.now() - startedAt;
  }

  return stats;
};


/*
 * ============================================================
 * PROCESS BATCH
 * ============================================================
 */

const processBatch = async (
  providers,
  stats,
  total,
  batchSize
) => {
  for (const provider of providers) {
    try {
      await uploadProviderResources(
        provider,
        stats,
        total
      );
    } catch (error) {
      stats.errors += 1;

      console.error(
        `Failed to sync provider ${
          provider?.npi || provider?._id
        }:`,
        error.message
      );
    }
  }

  console.log(
    `Processed batch of ${providers.length} providers`
  );
};


/*
 * ============================================================
 * UPLOAD ALL FHIR RESOURCES FOR ONE PROVIDER
 * ============================================================
 */

const uploadProviderResources = async (
  provider,
  stats,
  total
) => {
  const npi = provider?.npi;

  if (!npi) {
    throw new Error(
      "Provider NPI is required for FHIR synchronization"
    );
  }

  const isFacility =
    String(provider?.type || "").toUpperCase() ===
    "FACILITY";

  /*
   * ----------------------------------------------------------
   * 1. PRACTITIONER
   * ----------------------------------------------------------
   *
   * Individual provider:
   *
   * Practitioner
   *     |
   *     +---- PractitionerRole
   *
   */

  let practitionerResource = null;

  if (!isFacility) {
    practitionerResource =
      mappers.practitioner(provider);

    await hapiService.upsertResource(
      practitionerResource
    );

    stats.practitioners += 1;

    console.log(
      `Uploading Practitioner ${stats.practitioners}/${total}: ${npi}`
    );
  }


  /*
   * ----------------------------------------------------------
   * 2. ORGANIZATION / NETWORK
   * ----------------------------------------------------------
   *
   * IMPORTANT:
   *
   * PractitionerRole needs an Organization reference
   * when your implementation is representing the network.
   *
   * Therefore, create the Organization for the provider
   * instead of leaving organizationId undefined.
   *
   */

  let organizationResource = null;

  /*
   * Use the first available address only for the
   * Organization itself.
   *
   * All addresses will still be created as Locations below.
   */

  const firstPlan =
    Array.isArray(provider?.plans) &&
    provider.plans.length > 0
      ? provider.plans[0]
      : null;

  const firstAddress =
    Array.isArray(firstPlan?.addresses) &&
    firstPlan.addresses.length > 0
      ? firstPlan.addresses[0]
      : null;

  organizationResource =
    mappers.organization(
      provider,
      firstAddress
    );

  await hapiService.upsertResource(
    organizationResource
  );

  stats.organizations += 1;

  console.log(
    `Uploading Organization ${stats.organizations}/${total}: ${organizationResource.id}`
  );


  /*
   * ----------------------------------------------------------
   * 3. RESOURCE ID COLLECTIONS
   * ----------------------------------------------------------
   *
   * These IDs are later passed to PractitionerRole.
   *
   */

  const locationIds = [];
  const healthcareServiceIds = [];
  const endpointIds = [];
  const insurancePlanIds = [];


  /*
   * ----------------------------------------------------------
   * 4. PLANS
   * ----------------------------------------------------------
   */

  const plans = Array.isArray(provider?.plans)
    ? provider.plans
    : [];


  for (
    let planIndex = 0;
    planIndex < plans.length;
    planIndex += 1
  ) {
    const plan = plans[planIndex] || {};

    /*
     * --------------------------------------------------------
     * 4A. ADDRESSES
     * --------------------------------------------------------
     *
     * A provider can have multiple addresses.
     *
     * Each address gets:
     *
     * Location
     * Endpoint
     *
     * HealthcareService is also associated with
     * the corresponding address.
     *
     */

    const addresses = Array.isArray(plan?.addresses)
      ? plan.addresses
      : [];


    for (
      let addressIndex = 0;
      addressIndex < addresses.length;
      addressIndex += 1
    ) {
      const address =
        addresses[addressIndex];

      if (!address) {
        continue;
      }


      /*
       * ------------------------------------------------------
       * LOCATION
       * ------------------------------------------------------
       */

      const locationResource =
        mappers.location(
          provider,
          address,
          addressIndex,
          organizationResource.id
        );

      await hapiService.upsertResource(
        locationResource
      );

      locationIds.push(
        locationResource.id
      );

      stats.locations += 1;

      console.log(
        `Uploading Location ${stats.locations}/${total}: ${locationResource.id}`
      );


      /*
       * ------------------------------------------------------
       * HEALTHCARE SERVICE
       * ------------------------------------------------------
       *
       * IMPORTANT:
       *
       * Pass a unique address index.
       *
       * If the mapper generates service IDs only from NPI,
       * multiple addresses will overwrite the same
       * HealthcareService resource.
       *
       */

      const healthcareServiceResource =
        mappers.healthcareService(
          provider,
          plan,
          addressIndex
        );

      await hapiService.upsertResource(
        healthcareServiceResource
      );

      healthcareServiceIds.push(
        healthcareServiceResource.id
      );

      stats.healthcareServices += 1;

      console.log(
        `Uploading HealthcareService ${stats.healthcareServices}/${total}: ${healthcareServiceResource.id}`
      );


      /*
       * ------------------------------------------------------
       * ENDPOINT
       * ------------------------------------------------------
       */

      const endpointResource =
        mappers.endpoint(
          provider,
          address,
          addressIndex
        );

      await hapiService.upsertResource(
        endpointResource
      );

      endpointIds.push(
        endpointResource.id
      );

      stats.endpoints += 1;

      console.log(
        `Uploading Endpoint ${stats.endpoints}/${total}: ${endpointResource.id}`
      );
    }


    /*
     * --------------------------------------------------------
     * 4B. INSURANCE PLAN
     * --------------------------------------------------------
     */

    const insurancePlanResource =
      mappers.insurancePlan(
        provider,
        plan,
        planIndex
      );

    await hapiService.upsertResource(
      insurancePlanResource
    );

    insurancePlanIds.push(
      insurancePlanResource.id
    );

    stats.insurancePlans += 1;

    console.log(
      `Uploading InsurancePlan ${stats.insurancePlans}/${total}: ${insurancePlanResource.id}`
    );
  }


  /*
   * ----------------------------------------------------------
   * 5. PRACTITIONER ROLE
   * ----------------------------------------------------------
   *
   * Only create PractitionerRole for an individual provider.
   *
   * PractitionerRole connects:
   *
   * Practitioner
   *       |
   *       +---- Organization
   *       |
   *       +---- Location(s)
   *       |
   *       +---- HealthcareService(s)
   *       |
   *       +---- Endpoint(s)
   *       |
   *       +---- Specialty
   *
   */

  if (!isFacility && practitionerResource) {
    const practitionerRoleResource =
      mappers.practitionerRole(
        provider,

        /*
         * Practitioner reference
         */
        practitionerResource.id,

        /*
         * Network / Organization reference
         */
        organizationResource.id,

        /*
         * All provider locations
         */
        locationIds,

        /*
         * All healthcare services
         */
        healthcareServiceIds,

        /*
         * All endpoints
         */
        endpointIds
      );


    /*
     * Safety check.
     *
     * This prevents uploading a PractitionerRole
     * with an undefined practitioner reference.
     */

    if (
      !practitionerRoleResource?.practitioner
        ?.reference
    ) {
      throw new Error(
        `PractitionerRole for NPI ${npi} has no Practitioner reference`
      );
    }


    /*
     * Safety check for Organization.
     */

    if (
      !practitionerRoleResource?.organization
        ?.reference
    ) {
      throw new Error(
        `PractitionerRole for NPI ${npi} has no Organization reference`
      );
    }


    await hapiService.upsertResource(
      practitionerRoleResource
    );

    stats.practitionerRoles += 1;

    console.log(
      `Uploading PractitionerRole ${stats.practitionerRoles}/${total}: ${practitionerRoleResource.id}`
    );
  }


  console.log(
    `Completed FHIR sync for ${provider?.type} ${npi}`
  );
};


module.exports = {
  syncFhir,
};

