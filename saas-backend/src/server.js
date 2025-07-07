const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Importar configurações
const { sequelize, testConnection } = require("./config/database");
const {
  createDatabaseIfNotExists,
} = require("./config/createDatabaseIfNotExists");

// Importar modelos
const User = require("./models/User");
const Subscription = require("./models/Subscription");
const Plan = require("./models/Plan.model");
const UserData = require("./models/UserData.model");

// Importar seed
const { seedPlans } = require("./config/seedPlans");

// Importar rotas
const authRoutes = require("./routes/auth.router");
const userRoutes = require("./routes/users.router");
const subscriptionRoutes = require("./routes/subscriptions.router");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações de segurança
app.use(helmet());

// Configuração do CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://seu-dominio.com"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: {
    success: false,
    message: "Muitas requisições. Tente novamente em alguns minutos.",
  },
});
app.use("/api/", limiter);

// Middleware para parsing de JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Rota de health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SaaS Backend está funcionando!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bem-vindo ao SaaS Backend",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      subscriptions: "/api/subscriptions",
      health: "/health",
    },
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);

  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

// Função para inicializar dados do sistema
const initializeSystemData = async () => {
  try {
    console.log("🌱 Inicializando dados do sistema...");

    // Executar seed dos planos
    await seedPlans();

    console.log("✅ Dados do sistema inicializados!");
  } catch (error) {
    console.error("❌ Erro ao inicializar dados do sistema:", error);
    throw error;
  }
};

// Função para iniciar o servidor
const startServer = async () => {
  try {
    console.log("🚀 Iniciando SaaS Backend...");

    // Criar banco de dados se não existir
    await createDatabaseIfNotExists();

    // Testar conexão com o banco
    await testConnection();

    // Sincronizar modelos (criar tabelas se não existirem)
    console.log("🔄 Sincronizando modelos com o banco de dados...");
    await sequelize.sync({ alter: true });
    console.log("✅ Banco de dados sincronizado");

    // Inicializar dados do sistema
    await initializeSystemData();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📋 Health Check: http://localhost:${PORT}/health`);
      console.log("✨ SaaS Backend iniciado com sucesso!");
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

// Tratamento de sinais para graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Recebido SIGINT. Encerrando servidor...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Recebido SIGTERM. Encerrando servidor...");
  await sequelize.close();
  process.exit(0);
});

// Iniciar servidor
startServer();
