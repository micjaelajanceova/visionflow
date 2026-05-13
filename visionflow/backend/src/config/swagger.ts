import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

// Swagger definition
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LifeBoard API',
      version: '1.0.0',
      description: 'LifeBoard - Goal tracking, vision board, and task management REST API',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },

  // Path to the API docs
  apis: ['./src/routes/*.ts'],
}


// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const specs = swaggerJsdoc(options)


// Function to setup Swagger UI
export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
}
