import swaggerJsDoc from "swagger-jsdoc";
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
    servers: [
      {
        url: `http://localhost:3000`,
        description: `Development server`,
      },
    ],
    components: {
      schemas: {
        User: {
          type: `object`,
          properties: {
            id: {
              type: `integer`,
              example: 1,
            },
            email: {
              type: `string`,
              format: `email`,
              example: `user@email.com`,
            },
            userName: {
              type: `string`,
              example: "Ash Ketchum",
            },
          },
        },
        posts: {
          type: `object`,
          properties: {
            id: {
              type: `integer`,
              example: 1,
            },
            content: {
              type: `string`,
              example: `This is my main content of my post that users or my followers would see`,
            },
            user_id: {
              type: `integer`,
              example: 1,
            },
            created_at: {
              type: `date-time`,
              example: `2026-03-30T14:44:12.345Z`,
            },
            updated_at: {
              type: `date-time`,
              example: `2026-03-30T14:44:12.345Z`,
            },
          },
        },
        likes: {
          type: `object`,
          properties: {
            id: {
              type: `integer`,
              example: 1,
            },
            liked_at: {
              type: `date-time`,
              example: `2026-03-30T14:44:12.345Z`,
            },
          },
        },
        comments: {
          type: `object`,
          properties: {
            id: {
              type: `integer`,
              example: 2,
            },
            content: {
              type: `string`,
              example: `This will be the comment under a post that would be shown to others (slay 💅)`,
            },
            commented_at: {
              type: `date-time`,
              example: `2026-03-30T14:44:12.345Z`,
            },
            updated_at: {
              type: `date-time`,
              example: `2026-03-30T14:44:12.345Z`,
            },
          },
        },
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
  apis: ['../server/server.js', 
    './src/routes/*.js','../routes/*.js',path.join(__dirname,'../routes/*.js')],
};

const specs = swaggerJsDoc(options);

export default specs;
