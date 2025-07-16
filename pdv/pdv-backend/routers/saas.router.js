const express = require("express");
const router = express.Router();
const { loginSaas } = require("../controllers/saas.controller.js");

// Rota de login local (cliente/parceiro)
router.post("/login", loginSaas);

module.exports = router;
