const express = require("express");
const router = express.Router();
const {
  buscarNcm,
  atualizarCacheNcm,
} = require("../controllers/ncm.controller");

// Buscar NCM por código
router.get("/:codigo", buscarNcm);

// Forçar atualização do cache (endpoint administrativo)
router.post("/atualizar-cache", atualizarCacheNcm);

module.exports = router;
