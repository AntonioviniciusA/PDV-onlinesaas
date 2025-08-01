const express = require("express");
const router = express.Router();
const {
  getConfiguracoes,
  updateConfiguracoes,
  getTimezones,
  getPermissoes,
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  salvarToken,
  buscarToken,
  verificarTokenValido,
  limparToken,
} = require("../controllers/configuracoes_sistema.controller.js");
const auth = require("../middlewares/auth.middleware.js");

// Rotas para configurações do sistema
router.get("/", auth, getConfiguracoes);
router.put("/", auth, updateConfiguracoes);
router.get("/timezones", getTimezones);
router.get("/permissoes", auth, getPermissoes);

// Rotas para gerenciamento de usuários
router.get("/usuarios", auth, getUsuarios);
router.post("/usuarios", auth, createUsuario);
router.put("/usuarios/:id", auth, updateUsuario);
router.delete("/usuarios/:id", auth, deleteUsuario);

// Rotas para gerenciamento de token
router.post("/token", auth, salvarToken);
router.get("/token", auth, buscarToken);
router.get("/token/verificar", auth, verificarTokenValido);
router.delete("/token", auth, limparToken);

module.exports = router;
