const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware.js");
router.use("/cliente", require("./cliente.router.js"));
router.use("/parceiro-saas", require("./parceiro_saas.router.js"));
router.use("/assinaturas", require("./assinaturas.router.js"));
router.use("/plano", require("./planos.router.js"));
router.use("/pdv", require("./pdv.router.js"));
router.use("/verify-token", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Token verificado com sucesso",
  });
});

// Rota de health check para SaaS
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SaaS backend está saudável",
    timestamp: new Date().toISOString(),
  });
});

// Rota raiz
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bem-vindo ao SaaS Backend",
    version: "1.0.0",
    endpoints: {
      auth: "/api/cliente",
      assinaturass: "/api/assinaturass",
      planos: "/api/plano",
      health: "/health",
    },
  });
});

// Middleware de tratamento de erros
router.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);

  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

// Middleware para rotas não encontradas
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

module.exports = router;
