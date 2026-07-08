const express = require("express");
const { syncFhir } = require("../controller/fhirSync.controller");

const router = express.Router();

/**
 * @swagger
 * /api/fhir/sync:
 *   post:
 *     summary: Synchronize provider data to HAPI FHIR server
 *     description: |
 *       Initiates a synchronization process that reads provider records from MongoDB,
 *       transforms them into FHIR R4 resources, and uploads them to the HAPI FHIR server.
 *       
 *       The sync process includes:
 *       - Practitioner resources (provider individuals)
 *       - Organization resources (facility/organization data)
 *       - PractitionerRole resources (role associations)
 *       - Location resources (provider addresses)
 *       - HealthcareService resources (service offerings)
 *       - InsurancePlan resources (plan identifiers)
 *       - Endpoint resources (contact endpoints)
 *       
 *       All resources use deterministic IDs based on NPI, so re-running the sync
 *       will update existing resources instead of creating duplicates.
 *     tags:
 *       - FHIR Synchronization
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batchSize:
 *                 type: integer
 *                 description: Number of providers to process per batch
 *                 default: 100
 *                 minimum: 1
 *                 maximum: 1000
 *               page:
 *                 type: integer
 *                 description: Optional page number for pagination (1-indexed)
 *                 minimum: 1
 *               pageSize:
 *                 type: integer
 *                 description: Number of records per page when using pagination
 *                 default: 100
 *                 minimum: 1
 *             example:
 *               batchSize: 100
 *               page: 1
 *               pageSize: 100
 *     responses:
 *       200:
 *         description: FHIR synchronization completed successfully
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
 *                   example: "FHIR synchronization completed"
 *                 organizations:
 *                   type: integer
 *                   description: Total Organization resources uploaded
 *                   example: 120
 *                 practitioners:
 *                   type: integer
 *                   description: Total Practitioner resources uploaded
 *                   example: 550
 *                 locations:
 *                   type: integer
 *                   description: Total Location resources uploaded
 *                   example: 245
 *                 insurancePlans:
 *                   type: integer
 *                   description: Total InsurancePlan resources uploaded
 *                   example: 52
 *                 errors:
 *                   type: integer
 *                   description: Number of providers that failed to sync
 *                   example: 3
 *                 providersProcessed:
 *                   type: integer
 *                   description: Total number of providers processed
 *                   example: 550
 *                 durationMs:
 *                   type: integer
 *                   description: Total sync duration in milliseconds
 *                   example: 125400
 *       400:
 *         description: Bad request - invalid parameters
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
 *                   example: "Invalid batch size provided"
 *       500:
 *         description: Server error during synchronization
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
 *                   example: "FHIR synchronization failed"
 */
router.post("/fhir/sync", syncFhir);

module.exports = router;
