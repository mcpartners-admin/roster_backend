const facilityProviderService = require("../services/facility.provider.service");

const uploadFacilityProvidersFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }

    const result = await facilityProviderService.importFromExcel(req.file.path);
    return res.status(200).json({
      success: true,
      message: "Facility providers imported successfully",
      ...result,
    });
  } catch (error) {
    return res.status(error.statusCode || (error.name === "ValidationError" ? 400 : 500)).json({
      success: false,
      message: error.message || "Failed to import facility providers",
    });
  }
};

const uploadCommonProvidersFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }

    const result = await facilityProviderService.importCommonProvidersFromExcel(req.file.path);
    return res.status(200).json({
      success: true,
      message: "Providers imported into the common collection successfully",
      ...result,
    });
  } catch (error) {
    return res.status(error.statusCode || (error.name === "ValidationError" ? 400 : 500)).json({
      success: false,
      message: error.message || "Failed to import providers",
    });
  }
};

module.exports = { uploadFacilityProvidersFromExcel, uploadCommonProvidersFromExcel };
