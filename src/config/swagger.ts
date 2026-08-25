import swaggerJsDoc from "swagger-jsdoc";
import { generatedSchemas } from "./openapi-schemas.js";
import { fileURLToPath } from "url";
import path from 'path';


const fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileName)
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SocialBuzz (socialMedia app)",
      version: "1.0.0",
      description:
        "A backend REST API for a social media platform built with Node.js, Express, and PostgreSQL.",
      contact: {
        name: "Contact support",
        email: "socialBuzz@dev.com",
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: `http://localhost:3000`,
        description: `Development server`,
      },
    ],
    components: {
      schemas: {
        ...generatedSchemas
      },
      securitySchemes:{
        bearerAuth:{
            type:`http`,
            scheme:`bearer`,
            bearerFormat:`JWT`
        }
      }
    },
  },
  apis: [path.join(__dirname,'../routes/*.ts')],
};

const specs = swaggerJsDoc(options);

export default specs;
