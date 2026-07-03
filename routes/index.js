const express = require("express");
const providerRoutes = require("./provider.routes");

const router = express.Router();
router.use(providerRoutes);

module.exports = router;
