const XLSX = require("xlsx");
const PrimaryCareProvider = require("../schemas/primarycare.provider.schema");

/**
 * Maps Excel column names to MongoDB schema fields.
 */
const HEADER_MAP = {
  npi: "npi",
  firstname: "firstName",
  lastname: "lastName",
  startdate: "startDate",
  enddate: "endDate",
  degree: "degree",
  providerentityname: "providerEntityName",
  providertin: "providerTin",
  addressline1: "addressLine1",
  addressline2: "addressLine2",

  // Supports the typo "Adress Line 2" from the Excel file
  adressline2: "addressLine2",

  city: "city",
  state: "state",
  zip: "zip",
  zipcode: "zip",
  providerid: "providerId",
  practiceid: "practiceId",
  locationid: "locationId",
};

/**
 * Converts Excel header into a normalized format.
 *
 * Example:
 * "First Name" -> "firstname"
 * "Provider TIN" -> "providertin"
 */
const normalizeHeader = (header) => {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

/**
 * Converts an Excel cell value to a trimmed string.
 */
const cellToString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

/**
 * Converts Excel date values into JavaScript Date objects.
 *
 * Supported formats:
 * - Excel date serial number
 * - JavaScript Date
 * - MM/DD/YYYY
 */
const parseDate = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  // Already a JavaScript Date
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error(`Invalid date: ${value}`);
    }

    return value;
  }

  // Excel serial date
  if (typeof value === "number") {
    const excelDate = XLSX.SSF.parse_date_code(value);

    if (!excelDate) {
      throw new Error(`Invalid Excel date: ${value}`);
    }

    return new Date(
      Date.UTC(
        excelDate.y,
        excelDate.m - 1,
        excelDate.d
      )
    );
  }

  const dateText = String(value).trim();

  /**
   * Expected format:
   * MM/DD/YYYY
   *
   * Example:
   * 01/01/2027
   * 12/31/2027
   */
  const usDate = dateText.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (usDate) {
    const [, monthText, dayText, yearText] = usDate;

    const month = Number(monthText);
    const day = Number(dayText);
    const year = Number(yearText);

    const parsedDate = new Date(
      Date.UTC(year, month - 1, day)
    );

    // Validate the date
    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new Error(`Invalid date: ${value}`);
    }

    return parsedDate;
  }

  // Fallback for other valid date strings
  const parsedDate = new Date(dateText);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return parsedDate;
};

/**
 * Converts one Excel row into a MongoDB provider object.
 */
const mapExcelRowToProvider = (row) => {
  const providerData = {};

  Object.entries(row).forEach(([header, value]) => {
    const normalizedHeader = normalizeHeader(header);
    const fieldName = HEADER_MAP[normalizedHeader];

    // Ignore Excel columns that are not part of our schema
    if (!fieldName) {
      return;
    }

    // Convert date fields properly
    if (fieldName === "startDate") {
      providerData[fieldName] = "2027-01-01";
      return;
    }
    if(fieldName==="endDate"){
      providerData[fieldName]=parseDate(value);
    }

    providerData[fieldName] = cellToString(value);
  });

  return providerData;
};

/**
 * Checks whether an Excel row is completely empty.
 */
const isEmptyRow = (row) => {
  return Object.values(row).every(
    (value) => value === "" || value === null || value === undefined
  );
};

/**
 * Imports Primary Care Provider data from an Excel file.
 */
const importExcel = async (filePath) => {
  const workbook = XLSX.readFile(filePath, {
    cellDates: true,
  });

  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  if (!sheet) {
    throw new Error("The uploaded workbook has no worksheets");
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  if (!rows.length) {
    throw new Error("The Excel sheet contains no data rows");
  }

  const records = [];
  const failedRows = [];

  rows.forEach((row, index) => {
    // IMPORTANT:
    // Declare providerData outside try so catch can access it.
    let providerData = {};

    try {
      // Ignore completely empty rows
      if (isEmptyRow(row)) {
        return;
      }

      // Convert Excel row into MongoDB structure
      providerData = mapExcelRowToProvider(row);

      // Create Mongoose document
      const provider = new PrimaryCareProvider(providerData);

      // Validate before inserting
      const validationError = provider.validateSync();

      if (validationError) {
        failedRows.push({
          row: index + 2,
          npi: providerData.npi || "",
          message: validationError.message,
        });

        return;
      }

      records.push(provider.toObject());
    } catch (error) {
      failedRows.push({
        row: index + 2,
        npi: providerData.npi || "",
        message: error.message,
      });
    }
  });

  let insertedCount = 0;

  if (records.length > 0) {
    const insertedRecords = await PrimaryCareProvider.insertMany(
      records,
      {
        ordered: false,
      }
    );

    insertedCount = insertedRecords.length;
  }

  return {
    totalRows: rows.length,
    insertedCount,
    failedCount: failedRows.length,
    failedRows,
  };
};

module.exports = {
  importExcel,
};