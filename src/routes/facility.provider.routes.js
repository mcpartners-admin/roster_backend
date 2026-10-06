const express = require("express");
const multer = require("multer");
const {
  uploadFacilityProvidersFromExcel,
  uploadCommonProvidersFromExcel,
} = require("../controller/facility.provider.controller");

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

/**
 * @swagger
 * /api/facility-providers/upload:
 *   post:
 *     summary: Import facility providers from an Excel spreadsheet
 *     description: Spreadsheet columns are npi, facility type, facility name, languages (required), contract year (required), Primary Specialty (required), Secondary Speciality, Primary Specialty code (required), address (required), city (required), state (required), zip (required), and phone (required). Languages may be separated by commas, semicolons, or vertical bars.
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
 *     responses:
 *       200:
 *         description: Facility providers imported
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 importedCount: { type: integer }
 *       400:
 *         description: Missing file or invalid spreadsheet row
 *       500:
 *         description: Database or server error
 */
router.post(
  "/facility-providers/upload",
  upload.single("file"),
  uploadFacilityProvidersFromExcel
);

/**
 * @swagger
 * /api/facility-providers/upload-common:
 *   post:
 *     summary: Import provider, PCP, specialist, or facility Excel data into the common provider collection
 *     description: Accepts the supported roster, PCP, and facility spreadsheet headers. Rows are classified as individuals, primarycareproviders, specialists, or hospitals from their source columns and PCP/Spec value. Only non-empty spreadsheet cells are stored.
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
 *     responses:
 *       200:
 *         description: Provider rows imported
 *       400:
 *         description: Missing file or unsupported spreadsheet
 *       500:
 *         description: Database or server error
 */
router.post(
  "/facility-providers/upload-common",
  upload.single("file"),
  uploadCommonProvidersFromExcel
);

module.exports = router;
