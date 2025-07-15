const express = require("express");
const router = express.Router();
const { imprimirCupom } = require("../controllers/cupom.controller");

// Rota para imprimir cupom
router.post("/imprimir", imprimirCupom);

module.exports = router;
