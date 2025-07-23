const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

// Rota de login
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
router.post("/logout", authController.logout);

module.exports = router;
