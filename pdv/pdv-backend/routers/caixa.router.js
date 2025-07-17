const express = require("express");
const router = express.Router();
const {
  abrirCaixa,
  fecharCaixa,
} = require("../controllers/caixa.controller.js");

router.post("/abrir", abrirCaixa);
router.post("/fechar", fecharCaixa);

module.exports = router;
