const practitionerMapper = require("./practitioner.mapper");
const organizationMapper = require("./organization.mapper");
const practitionerRoleMapper = require("./practitionerRole.mapper");
const locationMapper = require("./location.mapper");
const healthcareServiceMapper = require("./healthcareService.mapper");
const insurancePlanMapper = require("./insurancePlan.mapper");
const endpointMapper = require("./endpoint.mapper");

module.exports = {
  practitioner: practitionerMapper,
  organization: organizationMapper,
  practitionerRole: practitionerRoleMapper,
  location: locationMapper,
  healthcareService: healthcareServiceMapper,
  insurancePlan: insurancePlanMapper,
  endpoint: endpointMapper,
};
