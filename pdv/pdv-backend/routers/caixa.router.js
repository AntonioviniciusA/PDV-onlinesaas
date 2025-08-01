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

// Rotas que precisam apenas de autorização (não de autenticação completa)
router.post("/autorizar", autorizarCaixa);
router.post("/check-autorizacao", checkAutorizacao);
router.post("/abrir", autorizar, abrirCaixa);
router.post("/fechar", autorizar, fecharCaixa);

// Rotas que precisam de autenticação completa
router.get("/abertos", auth, getCaixasAbertos);
router.get("/fechados", auth, getCaixasFechados);
router.get("/verifica-aberto", auth, verificaCaixaAberto);
router.get("/historico", auth, getHistoricoCaixas);
router.post("/finalizar-venda", auth, finalizarVenda);

module.exports = router;
