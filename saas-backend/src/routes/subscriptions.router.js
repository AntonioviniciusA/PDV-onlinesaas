const express = require("express");
const { body } = require("express-validator");
const subscriptionController = require("../controllers/subscription.controller");
const auth = require("../middlewares/auth.middleware");
const { checkTrialExpired } = require("../middlewares/trialCheck.middleware");

const router = express.Router();

// Validações
const createSubscriptionValidation = [
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
router.post("/webhook", subscriptionController.webhook);

// Rotas protegidas
router.use(auth);

// Rotas de assinatura
router.post(
  "/create",
  createSubscriptionValidation,
  subscriptionController.createSubscription
);
router.get("/status", subscriptionController.getSubscriptionStatus);
router.post("/cancel", subscriptionController.cancelSubscription);

module.exports = router;
