const express = require("express");
const { body } = require("express-validator");
const {
  createassinaturas,
  getassinaturastatus,
  cancelassinaturas,
  listUserassinaturas,
  webhook,
} = require("../controllers/assinaturas.controller.js");
const auth = require("../middlewares/auth.middleware");
const { checkTrialExpired } = require("../middlewares/trialCheck.middleware");

const router = express.Router();

// Validações
const createassinaturasValidation = [
  body("planName").trim().notEmpty().withMessage("Nome do plano é obrigatório"),
  body("planPrice")
    .isFloat({ min: 0.01 })
    .withMessage("Preço do plano deve ser um valor válido"),
  body("billingCycle")
    .isIn(["monthly", "yearly"])
    .withMessage("Ciclo de cobrança deve ser monthly ou yearly"),
  body("paymentMethod")
    .optional()
    .isIn(["BOLETO", "CREDIT_CARD", "PIX"])
    .withMessage("Método de pagamento inválido"),
];

// Webhook da ASSAS (não requer autenticação)
router.post("/webhook", webhook);

// Rotas protegidas
router.use(auth);

// Rotas de assinatura
router.post("/create", createassinaturasValidation, createassinaturas);
router.get("/status", getassinaturastatus);
router.get("/assinaturas", listUserassinaturas);
router.post("/cancel/:id", cancelassinaturas);

module.exports = router;
