const mongoose = require("mongoose");
const planSchema = require("./plan.schema");

const providerSchema = new mongoose.Schema(
  {
    rosterName: {
      type: String,
      required: true,
      trim: true,
      default: "providers",
    },
    npi: {
      type: String,
      required: true,
      unique: true,
      trim: true,

    },
    type: {
      type: String,
      required: true,
      enum: ["Individual", "Facility"],
      trim: true,
    },
    plans: { type: [planSchema], required: true, default: [] },
    lastUpdatedOn: {
      type: String,
      trim: true,
      // match: [/^\d{4}-\d{2}-\d{2}$/, "Last updated date must be in YYYY-MM-DD format"],
    },
    name: {
      prefix: { type: String, default:"" },
      first: { type: String, trim: true },
      middle: { type: String, trim: true },
      last: { type: String, trim: true },
      suffix: { type: String, default:""},
    },
    sex: { type: String, default:""},
    languages: { type: [String], default: [] },
    facilityName: { type: String, trim: true },
    facilityType: { type: [String], default: [] },
  },
  { timestamps: true }
);

providerSchema.pre("validate", function () {
  if (this.type === "Individual") {
    if (!this.name.first || !this.name.last) {
      this.invalidate(
        "name.first",
        "First name is required for individual providers"
      );
      this.invalidate(
        "name.last",
        "Last name is required for individual providers"
      );
    }

    // if (!this.languages || this.languages.length === 0) {
    //   this.invalidate(
    //     "languages",
    //     "Languages are required for individual providers"
    //   );
    // }
  }

  if (this.type === "Facility") {
    if (!this.facilityName) {
      this.invalidate(
        "facilityName",
        "Facility name is required for facility providers"
      );
    }

    if (!this.facilityType || this.facilityType.length === 0) {
      this.invalidate(
        "facilityType",
        "Facility type is required for facility providers"
      );
    }
  }
});

module.exports = mongoose.model("Provider", providerSchema);
