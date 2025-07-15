const express = require("express");
const router = express.Router();
router.use("/saas", require("./saas.router.js"));
router.use("/cupom", require("./cupom.router.js"));
module.exports = router;
