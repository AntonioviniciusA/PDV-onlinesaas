const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware.js");
const autorizar = require("../middlewares/autorizar.middleware.js");

router.use("/auth", require("./auth.router.js"));
router.use("/saas", require("./saas.router.js"));
router.use(auth);
router.use("/caixa", require("./caixa.router.js"));
router.use("/produtos", require("./produtos.router.js"));
router.use("/cupom", require("./cupom.router.js"));
router.use("/etiqueta", require("./etiqueta.router.js"));
router.use("/impressora", require("./impressora.router.js"));
router.use(
  "/configuracoes_sistema",
  require("./configuracoes_sistema.router.js")
);

module.exports = router;
