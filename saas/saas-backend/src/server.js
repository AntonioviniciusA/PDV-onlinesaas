const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Importar função de limpeza de tokens
const {
  limparTokensExpirados,
} = require("./controllers/cliente.controller.js");

// Importar configurações
const {
  pool,
  testConnection,
  connectDatabase,
  executeSqlFile,
  generateDatabase,
  createAdminUsers,
  validateDatabaseSchema,
  migrateDatabase,
} = require("./config/database");
// Importar seed
const { seedPlans } = require("./config/seedPlans");

const app = express();
const PORT = process.env.PORT;

// Configurações de segurança
app.use(helmet());

// Configuração do CORS
const allowedOrigins = [
  process.env.CORS_ORIGIN_1,
  process.env.CORS_ORIGIN_2,
  process.env.CORS_ORIGIN_3,
  process.env.CORS_ORIGIN_4,
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origem (como mobile apps ou curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Se precisar de cookies/auth
  optionsSuccessStatus: 204,
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: {
    success: false,
    message: "Muitas requisições. Tente novamente em alguns minutos.",
  },
});
app.use((req, res, next) => {
  res.setTimeout(15000, () => {
    console.log("Requisição estourou tempo limite");
    res.status(503).send("Servidor ocupado, tente novamente");
  });
  next();
});

// Middleware
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(limiter);

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

//rotas
app.use("/saas", require("./routes/saas.router.js"));

// Função para limpeza automática de tokens expirados
const iniciarLimpezaAutomatica = () => {
  // Limpa tokens expirados a cada 30 minutos
  const intervaloLimpeza = 30 * 60 * 1000; // 30 minutos

  setInterval(async () => {
    try {
      await limparTokensExpirados();
    } catch (error) {
      console.error("❌ Erro na limpeza automática de tokens:", error);
    }
  }, intervaloLimpeza);

  console.log(
    "🧹 Limpeza automática de tokens configurada (a cada 30 minutos)"
  );
};

// Função para iniciar o servidor
const startServer = async () => {
  // 1. Criar banco de dados
  try {
    console.log("🛠️ Criando banco de dados e tabelas...");
    await generateDatabase();
    console.log("✅ Banco de dados e tabelas criados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar banco de dados e tabelas:", error);
    process.exit(1);
  }

  // 2. Testar conexão
  try {
    console.log("🔌 Testando conexão com o banco de dados...");
    await testConnection();
    console.log("✅ Conexão com o banco de dados bem-sucedida!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }

  // 3. Inicializar dados do sistema
  try {
    console.log("🌱 Inicializando dados do sistema...");
    // Executar seed dos planos
    await seedPlans();
    console.log("✅ Dados do sistema inicializados!");
  } catch (error) {
    console.error("❌ Erro ao inicializar dados do sistema:", error);
    process.exit(1);
  }

  // 4. Limpeza inicial de tokens expirados
  try {
    console.log("🧹 Executando limpeza inicial de tokens expirados...");
    const tokensRemovidos = await limparTokensExpirados();
    console.log(
      `✅ ${tokensRemovidos} tokens expirados removidos na inicialização`
    );
  } catch (error) {
    console.error("❌ Erro na limpeza inicial de tokens:", error);
  }

  // 5. Iniciar limpeza automática
  iniciarLimpezaAutomatica();

  // 6. Iniciar servidor
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📋 Health Check: http://localhost:${PORT}/saas/health`);
      console.log("✨ SaaS Backend iniciado com sucesso!");
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor Express:", error);
    process.exit(1);
  }
};

// Tratamento de sinais para graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Recebido SIGINT. Encerrando servidor...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Recebido SIGTERM. Encerrando servidor...");
  process.exit(0);
});

// Iniciar servidor
startServer();
