const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeRow } = require("../src/normalizers/provider.normalizer");
const { validateNormalizedRow } = require("../src/validators/provider.validators");
const { createProvider } = require("../src/builders/provider.builder");

test("keeps Excel values as-is and only validates required fields", () => {
  const normalized = normalizeRow({
    "Provider NPI (Type1)": " 1234567890 ",
    "Provider/Org Type (PCP,SPC,FAC)": " PCP ",
    "Office Address": " 1 Main St ",
    "Office Address City": "New York",
    "Office Address State": "TX",
    "Office Address Zip": "12345",
    "Office Address Telephone": "5551234567",
    "Panel Status (Accepting)": "Accepting",
  });

  assert.equal(normalized.npi, " 1234567890 ");
  assert.equal(normalized.type, " PCP ");
  assert.equal(normalized.address, " 1 Main St ");
  assert.equal(normalized.city, "New York");
  assert.equal(normalized.state, "TX");
  assert.equal(normalized.zip, "12345");
  assert.equal(normalized.phone, "5551234567");
  assert.equal(normalized.accepting, "Accepting");
});

test("validates only required fields without format enforcement", () => {
  const validResult = validateNormalizedRow({
    npi: " 1234567890 ",
    address: " 1 Main St ",
    city: "New York",
    state: "TX",
    zip: "12345",
    phone: "5551234567",
    accepting: "Accepting",
    languages: ["English"],
    specialty: ["123"],
    year: ["2024"],
  });

  assert.equal(validResult.valid, true);

  const missingRequiredResult = validateNormalizedRow({
    npi: null,
    address: "",
    city: "",
    state: null,
    zip: null,
    phone: null,
    accepting: null,
  });

  assert.equal(missingRequiredResult.valid, false);
  assert.ok(missingRequiredResult.errors.some((issue) => issue.field === "npi"));
  assert.ok(missingRequiredResult.errors.some((issue) => issue.field === "address"));
  assert.ok(missingRequiredResult.errors.some((issue) => issue.field === "city"));
});

test("does not default accepting to Not Accepting when the value is missing", () => {
  const provider = createProvider({
    npi: "1234567890",
    accepting: null,
    year: ["2024"],
  });

  assert.equal(provider.plans[0].accepting, null);
});
