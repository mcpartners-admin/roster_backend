const mongoose = require("mongoose");
const addressSchema = require("./address.schema");

const planSchema = new mongoose.Schema(
  {
    maPlanId: { type: String, required: true, trim: true },
    yearContractYear: {
      type: String,
      trim: true,
    },
    addresses: { type: [addressSchema], default: [] },
    specialty: { type: [String],default: [] },
    accepting: { type: String,  default: "" },
    networkId: { type: [String], default: [] },
  },
  { _id: false }
);

module.exports = planSchema;
