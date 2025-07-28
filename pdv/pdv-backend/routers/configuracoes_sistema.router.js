const express = require("express");
const router = express.Router();
const {
  getConfiguracoes,
  updateConfiguracoes,
  getTimezones,
} = require("../controllers/configuracoes_sistema.controller.js");
const auth = require("../middlewares/auth.middleware.js");

// Rotas para configurações do sistema
router.get("/", auth, getConfiguracoes);
router.put("/", auth, updateConfiguracoes);
router.get("/timezones", getTimezones);

module.exports = router;
