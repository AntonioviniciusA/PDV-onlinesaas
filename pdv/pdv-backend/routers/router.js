const express = require("express");
const router = express.Router();
router.use("/saas", require("./saas.router.js"));
router.use("/cupom", require("./cupom.router.js"));
router.use("/etiqueta", require("./etiqueta.router.js"));

module.exports = router;
