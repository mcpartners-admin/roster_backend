const fhirSyncService = require("../services/fhirSync.service");

const syncFhir = async (req, res) => {
  try {
    const stats = await fhirSyncService.syncFhir(req.body || {});

    return res.status(200).json({
      success: true,
      message: "FHIR synchronization completed",
      ...stats,
    });
  } catch (error) {
    console.error("FHIR sync failed:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "FHIR synchronization failed",
    });
  }
};

module.exports = {
  syncFhir,
};
