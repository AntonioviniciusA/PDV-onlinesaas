const express = require("express");
const router = express.Router();
const {
  abrirCaixa,
  fecharCaixa,
  autorizarCaixa,
  checkAutorizacao,
  getCaixasAbertos,
  getCaixasFechados,
  verificaCaixaAberto,
} = require("../controllers/caixa.controller.js");
const autorizar = require("../middlewares/autorizar.middleware.js");

router.post("/abrir", autorizar, abrirCaixa);
router.post("/fechar", autorizar, fecharCaixa);
router.post("/autorizar", autorizarCaixa);
router.post("/check-autorizacao", checkAutorizacao);
router.get("/caixas-abertos", getCaixasAbertos);
router.get("/caixas-fechados", getCaixasFechados);
router.post("/verificar-caixa-aberto", verificaCaixaAberto);
module.exports = router;
