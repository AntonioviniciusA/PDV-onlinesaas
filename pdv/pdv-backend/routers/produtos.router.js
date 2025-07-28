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
const auth = require("../middlewares/auth.middleware.js");

router.post("/criar", auth, criarProduto);
router.get("/listar", listarProdutos);
router.get("/listar/:id", listarProdutoPorId);
router.put("/atualizar/:id", auth, atualizarProduto);
router.delete("/apagar/:id", auth, apagarProduto);
router.post("/atualizar-estoque-venda", atualizarEstoqueVenda);

module.exports = router;
