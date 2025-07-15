const express = require("express");
const router = express.Router();
const { verificarLicenca } = require("../controllers/pdv.controller.js");

router.get("/verificar-licenca", verificarLicenca);

module.exports = router;
