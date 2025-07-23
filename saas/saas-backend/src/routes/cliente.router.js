const express = require("express");
const router = express.Router();
const {
  registerCliente,
  loginCliente,
  getProfile,
  updateProfile,
  enviarCodigoVerificacao,
  verificarCodigo,
  verificarEmail,
  me,
} = require("../controllers/cliente.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
// Middleware de validação para registro e login de cliente

const { body, validationResult } = require("express-validator");

// Validação para registro de cliente considerando todos os campos
const validarRegistroCliente = [
  body("razao_social").notEmpty().withMessage("Razão social é obrigatória."),
  body("cnpj")
    .notEmpty()
    .withMessage("CNPJ é obrigatório.")
    .isLength({ min: 14, max: 18 })
    .withMessage("CNPJ deve ter entre 14 e 18 caracteres."),
  body("nome_representante")
    .notEmpty()
    .withMessage("Nome do representante é obrigatório."),
  body("cpf")
    .notEmpty()
    .withMessage("CPF é obrigatório.")
    .isLength({ min: 11, max: 14 })
    .withMessage("CPF deve ter entre 11 e 14 caracteres."),
  body("email")
    .notEmpty()
    .withMessage("E-mail é obrigatório.")
    .isEmail()
    .withMessage("E-mail inválido."),
  body("senha")
    .notEmpty()
    .withMessage("Senha é obrigatória.")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter pelo menos 6 caracteres."),
  body("telefone").notEmpty().withMessage("Telefone é obrigatório."),
  body("endereco").notEmpty().withMessage("Endereço é obrigatório."),
  body("cidade").notEmpty().withMessage("Cidade é obrigatória."),
  body("estado").notEmpty().withMessage("Estado é obrigatório."),
  body("cep").notEmpty().withMessage("CEP é obrigatório."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

// Validação para login de cliente
const validarLoginCliente = [
  body("email")
    .notEmpty()
    .withMessage("E-mail é obrigatório.")
    .isEmail()
    .withMessage("E-mail inválido."),
  body("senha").notEmpty().withMessage("Senha é obrigatória."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

router.post("/register", validarRegistroCliente, registerCliente);
router.post("/login", validarLoginCliente, loginCliente);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/enviar-codigo", enviarCodigoVerificacao);
router.post("/verificar-email", verificarEmail);
router.post("/verificar-codigo", verificarCodigo);
router.get("/me", authMiddleware, me);
module.exports = router;
