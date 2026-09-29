const express = require("express");
const providerRoutes = require("./provider.routes");
const fhirSyncRoutes = require("./fhirSync.routes");
const primaryCareProviderRoutes = require("./primarycare.provider.routes");

const router = express.Router();
router.use(providerRoutes);
router.use(fhirSyncRoutes);
router.use(primaryCareProviderRoutes);

module.exports = router;
