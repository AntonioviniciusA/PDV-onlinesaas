const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");

const router = express.Router();

// Validações
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve ter entre 2 e 100 caracteres"),
  body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter pelo menos 6 caracteres"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("Senha é obrigatória"),
];

// Rotas públicas
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);

// Rotas protegidas
router.post("/logout", auth, authController.logout);
router.get("/me", auth, authController.me);

module.exports = router;
