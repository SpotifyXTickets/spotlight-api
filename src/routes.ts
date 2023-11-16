import express from "express";
import AuthController from "./controllers/authorizationController";
import path from "path";
import asyncify from "express-asyncify";
import HomeController from "./controllers/homeController";
import EventController from "./controllers/eventController";
import swaggerUi from "swagger-ui-express"; // Import Swagger UI package
import swaggerJsdoc from "swagger-jsdoc";

const router = asyncify(express.Router());

const authController = new AuthController();
const authRoutes = authController.getRoutes();

authRoutes.forEach((route) => {
  router.get("/authorize" + route.uri, route.middlewares ?? [], route.method);
});

const homeController = new HomeController();
const homeRoutes = homeController.getRoutes();

homeRoutes.forEach((route) => {
  router.get(route.uri, route.middlewares ?? [], route.method);
});

const eventController = new EventController();
const eventRoutes = eventController.getRoutes();

eventRoutes.forEach((route) => {
  router.get("/events" + route.uri, route.middlewares ?? [], route.method);
});

// Swagger options specifying API metadata and server details
const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0", // Use OpenAPI version 3.0.0
    info: {
      title: "Spotify X TicketSwap", // Specify the title of your API
      version: "1.0.0", // Specify the version of your API
      description: "API documentation for our application", // Provide a description for your API
    },
    servers: [
      {
        url: "http://localhost:3000", // Specify the server URL where your API is hosted
      },
    ],
  },
  apis: ["./controllers/*.ts"], // Specify the path to include all your controller files for Swagger documentation
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger documentation at the "/api-docs" endpoint
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default router;
