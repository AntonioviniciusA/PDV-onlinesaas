const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware.js");

router.use("/saas", require("./saas.router.js"));
router.use(auth);
router.use("/cupom", require("./cupom.router.js"));
router.use("/etiqueta", require("./etiqueta.router.js"));
router.use("/auth", require("./auth.router.js"));
router.use("/caixa", require("./caixa.router.js"));
module.exports = router;
