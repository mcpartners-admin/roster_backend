const express = require("express");
const multer = require("multer");
const {
  getProvidersByRoster,
  uploadProvidersFromExcel,
  uploadSeedFromJson,
} = require("../controller/provider.controller");

const upload = multer({ dest: "uploads/" });
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

module.exports = router;
