const mongoose = require("mongoose");
const addressSchema = require("./address.schema");

const planSchema = new mongoose.Schema(
  {
    maPlanId: { type: String, required: true, trim: true },
    yearContractYear: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}$/, "Contract year must be 4 digits"],
    },
    addresses: { type: [addressSchema], required: true, default: [] },
    specialty: { type: [String], required: true, default: [] },
    accepting: { type: String, enum: ["Accepting", "Not Accepting"], default: "Accepting" },
    networkId: { type: String, trim: true },
  },
  { _id: false }
);

module.exports = planSchema;
