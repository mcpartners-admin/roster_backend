const express = require("express");
const multer = require("multer");
const {
  getProvidersByRoster,
  uploadProvidersFromExcel,
  uploadSeedFromJson,
  uploadFacilitiesFromExcel,
  getProvider
} = require("../controller/provider.controller");
const upload = multer({ dest: "src/uploads/" });
const router = express.Router();

/**
 * @swagger
 * /api/providers/{rosterName}:
 *   get:
 *     summary: Get providers by roster name
 *     parameters:
 *       - in: path
 *         name: rosterName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Providers fetched successfully
 */
router.get("/providers/:rosterName", getProvidersByRoster);

/**
 * @swagger
 * /api/providers/upload:
 *   post:
 *     summary: Upload an Excel file and convert it to a JSON output file
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Excel file converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 outputFile:
 *                   type: string
 *       400:
 *         description: Missing Excel file
 *       500:
 *         description: Server error while processing the Excel file
 */
router.post(
  "/providers/upload",
  upload.single("file"),
  uploadProvidersFromExcel
);

/**
 * @swagger
 * /api/providers/upload-facility:
 *   post:
 *     summary: Upload an Excel file and convert it to a JSON output file for facility
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Excel file converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 outputFile:
 *                   type: string
 *       400:
 *         description: Missing Excel file
 *       500:
 *         description: Server error while processing the Excel file
 */
router.post(
  "/providers/upload-facility",
  upload.single("file"),
  uploadFacilitiesFromExcel
);

/**
 * @swagger
 * /api/providers/seed:
 *   post:
 *     summary: Upload a JSON file containing roster data and seed it into the DB
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               rosterName:
 *                 type: string
 *                 description: Optional roster name to set on all records (defaults to 'providers')
 *     responses:
 *       200:
 *         description: Data seeded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 insertedCount:
 *                   type: integer
 *       400:
 *         description: Missing JSON file
 *       500:
 *         description: Server error while seeding the data
 */
router.post(
  "/providers/seed",
  upload.single("file"),
  uploadSeedFromJson
);
/**
 * @swagger
 * /api/search-provider:
 *   get:
 *     summary: Search providers by ZIP code and type
 *     description: Returns providers whose type and at least one plan address ZIP code match the supplied values exactly.
 *     parameters:
 *       - in: query
 *         name: zipCode
 *         required: true
 *         description: ZIP code to match against plan addresses, preserving leading zeros.
 *         schema:
 *           type: string
 *         example: "02108"
 *       - in: query
 *         name: type
 *         required: true
 *         description: Provider type, such as Individual or Facility (case-sensitive).
 *         schema:
 *           type: string
 *         example: Individual
 *     responses:
 *       200:
 *         description: Matching providers found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Data found successfully
 *                 data:
 *                   type: array
 *                   description: Matching provider documents, including their plans and addresses.
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *       400:
 *         description: Missing required query parameters or no matching providers found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: Null when no providers match; omitted when parameters are missing.
 *             examples:
 *               missingParameters:
 *                 value:
 *                   success: false
 *                   message: Zipcode and Type is required
 *               noMatches:
 *                 value:
 *                   success: false
 *                   message: No data found
 *                   data: null
 *       500:
 *         description: Unexpected server error while searching providers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message from the server.
 */
router.get("/search-provider",getProvider)
module.exports = router;
