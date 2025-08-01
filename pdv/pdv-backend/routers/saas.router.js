const express = require("express");
const router = express.Router();
const saasController = require("../controllers/saas.controller.js");

// Rota de login local (cliente/parceiro)
router.post("/login", saasController.loginSaas);
router.get("/me", saasController.meSaas);
router.post("/verify-token", saasController.verifyTokenSaas);

module.exports = router;
