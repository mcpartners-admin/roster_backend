const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    address: { type: String, default:"", trim: true },
    address2: { type: String, default: "", trim: true },
    city: { type: String,default:"" ,trim: true },
    state: {
      type: String,
      trim: true,
    },
    zip: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,  
    },
  },
  { _id: false }
);

module.exports = addressSchema;
