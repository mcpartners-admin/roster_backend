const XLSX = require("xlsx");
const PrimaryCareProvider = require("../schemas/primarycare.provider.schema");
const Specialist = require("../schemas/specialist.schema");

// Excel files commonly contain the Unicode ligature "ﬁ" in "ﬁrst name".
// Normalize compatibility characters before removing punctuation so it maps
// to the same key as the plain ASCII "first name" header.
const normalizeHeader = (header) => String(header || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "")
  .replace(/required$/, "");
const value = (row, ...names) => {
  const found = Object.entries(row).find(([header]) => names.includes(normalizeHeader(header)));
  return found && found[1] != null ? String(found[1]).trim() : "";
};
const splitList = (text) => text ? text.split(/[,;|]/).map((item) => item.trim()).filter(Boolean) : [];
const isEmptyRow = (row) => Object.values(row).every((item) => item === "" || item == null);

const normalizeIdentityPart = (item) => String(item || "").trim().toLowerCase();
const specialistIdentity = (data) => JSON.stringify([
    normalizeIdentityPart(data.npi),
    normalizeIdentityPart(data.name?.first),
    normalizeIdentityPart(data.name?.last),
    normalizeIdentityPart(data.address?.address),
    normalizeIdentityPart(data.address?.address2),
    normalizeIdentityPart(data.address?.city),
    normalizeIdentityPart(data.address?.state),
    normalizeIdentityPart(data.address?.zip),
]);

// Older versions created a unique index on NPI alone. Remove that obsolete
// index so multiple distinct specialist records can share an NPI.
const removeLegacyUniqueNpiIndex = async () => {
  const indexes = await Specialist.collection.indexes();
  const legacyIndex = indexes.find((index) => index.unique && index.key?.npi === 1 && Object.keys(index.key).length === 1);
  if (legacyIndex) await Specialist.collection.dropIndex(legacyIndex.name);
};

const getHeaderRowIndex = (sheet) => {
  const requiredHeaders = ["npi", "firstname", "lastname", "pcpspecialty"];
  const headerRows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
  for (let index = 0; index < Math.min(headerRows.length, 30); index += 1) {
    const firstRow = headerRows[index] || [];
    const headers = new Set(firstRow.map(normalizeHeader));
    if (requiredHeaders.every((header) => headers.has(header))) return index;
  }
  return -1;
};

const readRowsBelowHeaders = (sheet, headerRowIndex) => {
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false, blankrows: false });
  const headers = matrix[headerRowIndex] || [];
  return matrix.slice(headerRowIndex + 1).map((cells) => {
    const row = {};
    headers.forEach((header, index) => {
      if (header !== "" && header != null) row[header] = cells[index] ?? "";
    });
    return row;
  });
};

const mapPcp = (row) => ({
  npi: value(row, "npi"),
  firstName: value(row, "firstname"),
  lastName: value(row, "lastname"),
  providerEntityName: value(row, "group", "groupname"),
  addressLine1: value(row, "address"),
  addressLine2: value(row, "address2"),
  city: value(row, "city"),
  state: value(row, "state"),
  zip: value(row, "zip"),
  degree: value(row, "type"),
  accepting: value(row, "accepting"),
  practiceId: value(row, "groupid"),
  providerId: value(row, "mcproviderid", "mcpproviderid"),
});

const mapSpecialist = (row) => ({
  npi: value(row, "npi"),
  type: value(row, "type"),
  name: { first: value(row, "firstname"), last: value(row, "lastname") },
  languages: splitList(value(row, "languages")),
  // PCP/Specialty is the row classifier (SPC/PCP), not a specialty name.
  specialty: splitList(value(row, "primaryspecialty", "specialty")),
  accepting: value(row, "accepting"),
  networkId: splitList(value(row, "networkid")),
  address: {
    address: value(row, "address"), address2: value(row, "address2"),
    city: value(row, "city"), state: value(row, "state"), zip: value(row, "zip"),
    phone: value(row, "phone"),
  },
  groupName: value(row, "group"),
  contractYear: value(row, "contractyear"),
  primarySpecialty: value(row, "primaryspecialty"),
  specialistCode: value(row, "specialistcode"),
  pcpSpecialty: value(row, "pcpspecialty"),
  specialtyCode: value(row, "specialtycode"),
  groupId: value(row, "groupid"),
  mcpProviderId: value(row, "mcpproviderid"),
  providerType: value(row, "typespcialistpcp", "typespecialistpcp", "providertype"),
});

const importExcel = async (filePath) => {
  await removeLegacyUniqueNpiIndex();
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const secondSheetName = workbook.SheetNames[1];
  const sheet = secondSheetName ? workbook.Sheets[secondSheetName] : null;
  if (!sheet) throw new Error("The uploaded workbook has no worksheets");
  const headerRowIndex = getHeaderRowIndex(sheet);
  if (headerRowIndex < 0) {
    throw new Error("Could not find the roster headers on the second worksheet");
  }
  const rows = readRowsBelowHeaders(sheet, headerRowIndex);
  if (!rows.length) throw new Error("The Excel sheet contains no data rows");

  const candidates = { pcp: [], specialist: [] };
  const failedRows = [];
  rows.forEach((row, index) => {
    if (isEmptyRow(row)) return;
    const rowNumber = index + headerRowIndex + 2;
    const classification = value(row, "pcpspecialty").toUpperCase();
    const isSpecialist = classification === "SPC";
    if (!isSpecialist && classification !== "PCP") {
      failedRows.push({ row: rowNumber, npi: value(row, "npi"), message: 'PCP/Specialty must be "SPC" or "PCP"' });
      return;
    }
    const Model = isSpecialist ? Specialist : PrimaryCareProvider;
    const data = isSpecialist ? mapSpecialist(row) : mapPcp(row);
    if (isSpecialist) {
      const missing = [
        ["npi", data.npi], ["first name", data.name.first], ["last name", data.name.last],
        ["address", data.address.address], ["city", data.address.city],
        ["state", data.address.state], ["zip", data.address.zip],
      ].filter(([, fieldValue]) => !fieldValue).map(([field]) => field);
      if (missing.length) {
        failedRows.push({ row: rowNumber, npi: data.npi || "", message: `Missing required specialist fields: ${missing.join(", ")}` });
        return;
      }
    }
    const doc = new Model(data);
    const error = doc.validateSync();
    if (error) {
      failedRows.push({ row: rowNumber, npi: data.npi || "", message: error.message });
      return;
    }
    candidates[isSpecialist ? "specialist" : "pcp"].push({ row: rowNumber, data: doc.toObject() });
  });

  const duplicateRows = [];
  const insertedCounts = { pcp: 0, specialist: 0 };
  for (const [kind, Model] of [["pcp", PrimaryCareProvider], ["specialist", Specialist]]) {
    const batch = candidates[kind];
    const seen = new Set();
    const existingNpis = [...new Set(batch.map(({ data }) => data.npi))];
    const existing = existingNpis.length
      ? await Model.find({ npi: { $in: existingNpis } }).lean()
      : [];
    const existingSet = new Set(
      kind === "specialist"
        ? existing.map(specialistIdentity)
        : existing.map((item) => item.npi)
    );
    const records = [];
    for (const item of batch) {
      const identity = kind === "specialist" ? specialistIdentity(item.data) : item.data.npi;
      if (kind === "specialist"
        ? existingSet.has(identity) || seen.has(identity)
        : item.data.npi && (existingSet.has(identity) || seen.has(identity))) {
        duplicateRows.push({ row: item.row, npi: item.data.npi, message: `Duplicate ${kind} NPI already exists` });
      } else {
        if (kind === "specialist" || item.data.npi) seen.add(identity);
        records.push(item.data);
      }
    }
    if (records.length) insertedCounts[kind] = (await Model.insertMany(records, { ordered: false })).length;
  }

  const insertedCount = insertedCounts.pcp + insertedCounts.specialist;
  return {
    totalRows: rows.length, insertedCount, insertedPcpCount: insertedCounts.pcp,
    insertedSpecialistCount: insertedCounts.specialist,
    duplicateCount: duplicateRows.length, duplicateRows,
    failedCount: failedRows.length, failedRows,
  };
};

module.exports = { importExcel };
