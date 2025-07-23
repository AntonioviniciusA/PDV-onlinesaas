const express = require("express");
const router = express.Router();
const {
  getConfiguracoesSistema,
  atualizarConfiguracoesSistema,
} = require("../controllers/configuracoes_sistema.controller.js");

// Rota para buscar configuração do sistema
router.get("/", getConfiguracoesSistema);

// Rota para atualizar configuração do sistema
router.post("/", atualizarConfiguracoesSistema);

module.exports = router;
