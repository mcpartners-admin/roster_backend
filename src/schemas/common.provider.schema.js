const mongoose = require("mongoose");

const commonProviderSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["individuals", "primarycareproviders", "specialists", "hospitals"],
      index: true,
    },
    npi: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    degree: { type: String, trim: true },
    address: { type: String, trim: true },
    address2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true, index: true },
    facilityName: { type: String, trim: true },
    facilityType: { type: String, trim: true },
    primarySpecialty: { type: String, trim: true },
    secondarySpecialty: { type: String, trim: true },
    primarySpecialtyCode: { type: String, trim: true },
    phone: { type: String, trim: true },
    languages: { type: [String], default: undefined },
    providerEntityName: { type: String, trim: true },
    sex: { type: String, trim: true },
    taxId: { type: String, trim: true },
    namePerW9: { type: String, trim: true },
    pcpSpec: { type: String, trim: true },
    billingAddress: { type: String, trim: true },
    billingCity: { type: String, trim: true },
    billingState: { type: String, trim: true },
    billingZip: { type: String, trim: true },
    county: { type: String, trim: true },
    network: { type: String, trim: true },
    effectiveDate: { type: String, trim: true },
    terminationDate: { type: String, trim: true },
    credentialingStatus: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    providerTin: { type: String, trim: true },
    providerId: { type: String, trim: true },
    practiceId: { type: String, trim: true },
    locationId: { type: String, trim: true },
    contractYear: { type: String, trim: true },
  },
  { timestamps: true }
);

commonProviderSchema.index({ type: 1, firstName: 1, lastName: 1 });
commonProviderSchema.index({ type: 1, zip: 1 });
commonProviderSchema.index({ type: 1, facilityName: 1 });
commonProviderSchema.index({ type: 1, primarySpecialty: 1 });

module.exports = mongoose.model("CommonProvider", commonProviderSchema);
