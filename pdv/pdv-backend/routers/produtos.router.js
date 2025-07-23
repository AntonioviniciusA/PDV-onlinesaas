const express = require("express");
const router = express.Router();
const {
  criarProduto,
  listarProdutos,
  listarProdutoPorId,
  atualizarProduto,
  apagarProduto,
  atualizarEstoqueVenda,
} = require("../controllers/produtos.controller.js");
const autorizar = require("../middlewares/autorizar.middleware.js");

router.post("/criar", autorizar, criarProduto);
router.get("/listar", listarProdutos);
router.get("/listar/:id", listarProdutoPorId);
router.put("/atualizar/:id", autorizar, atualizarProduto);
router.delete("/apagar/:id", autorizar, apagarProduto);
router.post("/atualizar-estoque-venda", atualizarEstoqueVenda);

module.exports = router;
