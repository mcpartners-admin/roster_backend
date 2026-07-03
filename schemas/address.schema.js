const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    address2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{2}$/, "State must be a two-letter abbreviation"],
    },
    zip: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{5}$/, "ZIP code must be 5 digits"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
  },
  { _id: false }
);

module.exports = addressSchema;
