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
 *     summary: Search providers by ZIP code, type, name, and address
 *     description: Type is required. ZIP code, name, and address are optional filters and may be used in any combination. Name and address use case-insensitive partial matching.
 *     parameters:
 *       - in: query
 *         name: zipCode
 *         description: Optional ZIP code filter; leading zeros are preserved.
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
 *       - in: query
 *         name: name
 *         required: false
 *         description: Partial first name, last name, or facility name to match (case-insensitive).
 *         schema:
 *           type: string
 *         example: Jane
 *       - in: query
 *         name: address
 *         required: false
 *         description: Partial street address, city, or state to match (case-insensitive).
 *         schema:
 *           type: string
 *         example: Main Street
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
