const express = require("express");
const router = express.Router();
const {
  getEtiquetaConfig,
  saveEtiquetaConfig,
  updateEtiquetaConfig,
  listDefaultEtiquetaTemplates,
  listEtiquetaTemplates,
  imprimirEtiqueta,
} = require("../controllers/etiqueta.controller.js");

// Rotas de configuração de etiqueta
router.get("/etiqueta-config", getEtiquetaConfig);
router.post("/etiqueta-config", saveEtiquetaConfig);
router.put("/etiqueta-config/:id", updateEtiquetaConfig);
router.get("/etiqueta-templates-default", listDefaultEtiquetaTemplates);
router.get("/etiqueta-templates", listEtiquetaTemplates);
router.post("/etiqueta-imprimir", imprimirEtiqueta);
module.exports = router;
