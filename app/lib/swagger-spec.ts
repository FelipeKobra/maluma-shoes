import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Maluma Shoes API",
      version: "1.0.0",
      description: "Documentação Maluma Shoes ",
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
    servers: [
      {
        url: "https://maluma-shoes.vercel.app",
        description: "Servidor local",
      },
    ],
  },

  apis: [
    "./app/api/**/*.ts", 
  ],
};

const spec = swaggerJsdoc(options);

export default spec;