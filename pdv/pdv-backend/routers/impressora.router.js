const express = require("express");
const router = express.Router();
const {
  listarImpressoras,
  getImpressoraConfig,
  salvarImpressoraConfig,
} = require("../controllers/impressora.controller");

// Lista impressoras disponíveis
router.get("/printers", listarImpressoras);
// Busca configuração salva
router.get("/config", getImpressoraConfig);
// Salva configuração escolhida
router.post("/select", salvarImpressoraConfig);

module.exports = router;
