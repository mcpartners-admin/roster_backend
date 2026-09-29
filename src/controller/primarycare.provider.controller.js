const fs = require("fs-extra");
const primaryCareProviderService = require("../services/primarycare.provider.service");

const uploadPrimaryCareProvidersFromExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Excel file is required" });
  }

  try {
    const result = await primaryCareProviderService.importExcel(req.file.path);
    return res.status(200).json({
      success: result.failedRows.length === 0,
      message: "Excel import completed",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to import Excel file" });
  } finally {
    try {
      await fs.remove(req.file.path);
    } catch (error) {
      console.warn("Failed to remove uploaded Excel file:", error.message);
    }
  }
};

module.exports = { uploadPrimaryCareProvidersFromExcel };
