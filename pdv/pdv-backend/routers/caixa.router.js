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
  getHistoricoCaixas,
  finalizarVenda,
} = require("../controllers/caixa.controller.js");
const autorizar = require("../middlewares/autorizar.middleware.js");
const auth = require("../middlewares/auth.middleware.js");

router.post("/abrir", autorizar, abrirCaixa);
router.post("/fechar", autorizar, fecharCaixa);
router.post("/autorizar", autorizarCaixa);
router.post("/check-autorizacao", checkAutorizacao);
router.get("/caixas-abertos", getCaixasAbertos);
router.get("/caixas-fechados", getCaixasFechados);
router.post("/verificar-caixa-aberto", verificaCaixaAberto);
router.get("/historico", auth, getHistoricoCaixas);
router.post("/finalizar-venda", auth, finalizarVenda);
module.exports = router;
