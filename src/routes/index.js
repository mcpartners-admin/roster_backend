const express = require("express");
const providerRoutes = require("./provider.routes");
const fhirSyncRoutes = require("./fhirSync.routes");

const router = express.Router();
router.use(providerRoutes);
router.use(fhirSyncRoutes);

module.exports = router;
