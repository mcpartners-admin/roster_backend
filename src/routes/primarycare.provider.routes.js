const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadPrimaryCareProvidersFromExcel } = require("../controller/primarycare.provider.controller");

const router = express.Router();
const upload = multer({
  dest: "src/uploads/",
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (![".xlsx", ".xls"].includes(extension)) {
      return callback(new Error("Only .xlsx and .xls Excel files are supported"));
    }
    callback(null, true);
  },
});

/**
 * @swagger
 * /api/primary-care-providers/upload:
 *   post:
 *     summary: Import primary care providers from an Excel workbook
 *     description: Reads the first worksheet and inserts valid rows. Headers are matched without regard to case, spaces, underscores, or punctuation; the misspelled "Adress Line 2" header is also accepted.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel workbook (.xlsx or .xls), maximum 20 MB.
 *     responses:
 *       200:
 *         description: Import completed; invalid rows are listed in failedRows.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 totalRows:
 *                   type: integer
 *                 insertedCount:
 *                   type: integer
 *                 failedRows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: integer
 *                       npi:
 *                         type: string
 *                       message:
 *                         type: string
 *       400:
 *         description: Missing file, unsupported file type, invalid workbook, or empty worksheet.
 *       500:
 *         description: Database or server error.
 */
router.post("/primary-care-providers/upload", upload.single("file"), uploadPrimaryCareProvidersFromExcel);

module.exports = router;
