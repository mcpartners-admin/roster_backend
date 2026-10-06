const mongoose = require("mongoose");

const facilityProviderSchema = new mongoose.Schema(
  {
    npi: { type: String, trim: true, default: "" },
    facilityType: { type: String, trim: true, default: "" },
    facilityName: { type: String, trim: true, default: "" },
    languages: { type: [String], required: true, validate: {
      validator: (value) => Array.isArray(value) && value.length > 0,
      message: "At least one language is required",
    } },
    contractYear: { type: String, trim: true,default:"2027", required: true },
    primarySpecialty: { type: String, trim: true, required: true },
    secondarySpeciality: { type: String, trim: true, default: "" },
    primarySpecialtyCode: { type: String, trim: true, required: true },
    address: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    zip: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FacilityProvider", facilityProviderSchema);
