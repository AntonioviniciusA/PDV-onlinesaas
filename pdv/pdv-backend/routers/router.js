const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware.js");

router.use("/saas", require("./saas.router.js"));
router.use("/cupom", auth, require("./cupom.router.js"));
router.use("/etiqueta", auth, require("./etiqueta.router.js"));
router.use("/auth", require("./auth.router.js"));

module.exports = router;
