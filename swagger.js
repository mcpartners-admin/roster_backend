const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Roster API",
      version: "1.0.0",
      description: "API for MA provider and facility roster data",
    },
  },
  apis: ["./routes/**/*.js"],
};

module.exports = swaggerJSDoc(options);
