const express = require("express");
const router = express.Router();
const {
  registerParceiro,
  loginParceiro,
} = require("../controllers/parceiro_saas.controller.js");

router.post("/register", registerParceiro);
router.post("/login", loginParceiro);

module.exports = router;
