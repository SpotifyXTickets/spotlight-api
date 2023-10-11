import express from "express";
import AuthController from "./controllers/authorizationController";
import path from "path";
import asyncify from "express-asyncify";
import HomeController from "./controllers/homeController";
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

module.exports = router;

export default router;
