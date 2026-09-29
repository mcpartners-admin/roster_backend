const mongoose = require("mongoose");

const primaryCareProviderSchema = new mongoose.Schema(
  {
    npi: { type: String, trim: true, required: true },
    firstName: { type: String, trim: true, required: true, default: "" },
    lastName: { type: String, trim: true, required: true, default: "" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    degree: { type: String, trim: true, required: true, default: "" },
    providerEntityName: { type: String, required: true, trim: true, default: "" },
    providerTin: { type: String, required: true, trim: true, default: "" },
    addressLine1: { type: String, required: true, trim: true, default: "" },
    addressLine2: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true, default: "" },
    state: { type: String, required: true, trim: true, default: "" },
    zip: { type: String, required: true, trim: true, default: "" },
    providerId: { type: String, trim: true, default: "" },
    practiceId: { type: String, trim: true, default: "" },
    locationId: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrimaryCareProvider", primaryCareProviderSchema);
