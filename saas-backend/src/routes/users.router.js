const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const { checkAccess } = require("../middlewares/trialCheck.middleware");

const router = express.Router();

// Validações
const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve ter entre 2 e 100 caracteres"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Email inválido"),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Senha atual é obrigatória"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Nova senha deve ter pelo menos 6 caracteres"),
];

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de perfil
router.get("/profile", userController.getProfile);
router.put("/profile", updateProfileValidation, userController.updateProfile);
router.put(
  "/change-password",
  changePasswordValidation,
  userController.changePassword
);

// Rota para verificar status de acesso (não requer verificação de trial)
router.get("/access-status", userController.checkAccessStatus);

module.exports = router;
