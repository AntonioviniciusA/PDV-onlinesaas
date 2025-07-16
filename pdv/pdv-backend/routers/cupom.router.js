const express = require("express");
const router = express.Router();
const {
  imprimirCupomThermal,
  imprimirReciboThermal,
  imprimirCupomOffline,
  imprimirReciboOffline,
} = require("../controllers/cupom.controller.js");

// Rota para imprimir cupom
router.post("/print-thermal-cupom", imprimirCupomThermal);
router.post("/print-thermal-recibo", imprimirReciboThermal);
router.post("/print-thermal-cupom-offline", imprimirCupomOffline);
router.post("/print-thermal-recibo-offline", imprimirReciboOffline);
module.exports = router;
