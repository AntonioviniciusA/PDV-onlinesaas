const express = require("express");
const router = express.Router();
const {
  verifySubscription,
  verificarBancoExiste,
  loginSaas,
} = require("../controllers/saas.controller.js");

// Rota para verificar se a assinatura do cliente está ativa
router.get("/pdv/verificar-licenca/:idcliente", verifySubscription);

// Rota para verificar se o banco local existe
router.get("/db-exists", verificarBancoExiste);

// Rota de login local (cliente/parceiro)
router.post("/login", loginSaas);

module.exports = router;
