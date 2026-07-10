const PROVIDER_TYPES = ["Individual", "Facility"];
const PREFIXES = ["Mr.", "Mrs.", "Miss", "Ms.", "Dr."];
const SUFFIXES = ["Jr.", "Sr.", "II", "III", "IV"];
const SEX_VALUES = ["Male", "Female"];
const ACCEPTING_VALUES = ["Accepting", "Not Accepting"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NPI_PATTERN = /^\d{10}$/;
const STATE_PATTERN = /^[A-Z]{2}$/;
const ZIP_PATTERN = /^\d{5}$/;
const PHONE_PATTERN = /^\d{10}$/;
const MA_PLAN_ID_PATTERN = /^H\d{4}-\d{3}-\d{3}$/;
const SPECIALTY_PATTERN = /^(\d{3})$/i;
const DEFAULT_PLAN_IDS = ["H5767-001-000","H5767-002-000","H5767-003-000"];
const DEFAULT_YEAR = ["2027"];

module.exports = {
  PROVIDER_TYPES,
  PREFIXES,
  SUFFIXES,
  SEX_VALUES,
  ACCEPTING_VALUES,
  DATE_PATTERN,
  NPI_PATTERN,
  STATE_PATTERN,
  ZIP_PATTERN,
  PHONE_PATTERN,
  MA_PLAN_ID_PATTERN,
  SPECIALTY_PATTERN,
  DEFAULT_PLAN_IDS,
  DEFAULT_YEAR,
};
