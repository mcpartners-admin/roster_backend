const mongoose = require("mongoose");

const specialistSchema = new mongoose.Schema(
  {
    npi: { type: String, trim: true, default: "" },
    type: { type: String, trim: true, default: "" },
    name: {
      prefix: { type: String, default: "" },
      first: { type: String, default: "", trim: true },
      middle: { type: String, default: "", trim: true },
      last: { type: String, default: "", trim: true },
      suffix: { type: String, default: "" },
    },
    sex: { type: String, default: "" },
    languages: { type: [String], default: [] },
    specialty: { type: [String], default: [] },
    accepting: { type: String, default: "Accepting" },
    networkId: { type: [String], default: [] },
    address: {
      address: { type: String, default: "", trim: true },
      address2: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, trim: true, default: "" },
      zip: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
    },
    groupName: { type: String, default: "" },
    contractYear: { type: String, default: "" },
    primarySpecialty: { type: String, default: "" },
    specialistCode: { type: String, default: "" },
    pcpSpecialty: { type: String, default: "" },
    specialtyCode: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Specialist", specialistSchema);
