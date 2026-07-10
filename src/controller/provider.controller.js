const providerService = require("../services/provider.service");
const fs = require("fs-extra");

const getProvidersByRoster = async (req, res) => {
  try {
    const { rosterName } = req.params;
    const providers = await providerService.getProvidersByRoster(rosterName);

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch providers",
    });
  }
};

const uploadProvidersFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }
 console.log("Received file:", req.file.originalname, "at", req.file.path);
    const outputFile = await providerService.convertExcelToJson(req.file.path);

    return res.status(200).json({
      success: true,
      message: "Excel file converted successfully",
      outputFile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process Excel file",
    });
  }
};

const uploadSeedFromJson = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "JSON file is required",
      });
    }

    const rosterName = req.body.rosterName || "providers";

    const rosterData = await fs.readJson(req.file.path);

    const inserted = await providerService.addRosterData(rosterData, rosterName);

    // cleanup uploaded file
    try {
      await fs.remove(req.file.path);
    } catch (e) {
      // non-fatal
      console.warn("Failed to remove uploaded file:", req.file.path, e.message);
    }

    return res.status(200).json({
      success: true,
      message: "Data seeded successfully",
      data: { insertedCount: inserted.inserted,failedCount: inserted.failed.length },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to seed data",
    });
  }
};

module.exports = {
  getProvidersByRoster,
  uploadProvidersFromExcel,
  uploadSeedFromJson,
};
