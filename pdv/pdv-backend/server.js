// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const {
  generateDatabase,
  testConnection,
  sincronizarProdutos,
  sincronizarCupons,
  sincronizarRecibos,
  sincronizarVendas,
} = require("./config/database");

const app = express();
const PORT = process.env.PORT;

// Middleware de segurança
app.use(helmet());

// CORS básico local
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware simples de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use("/local", require("./routers/router.js"));

// Inicializar servidor
const startServer = async () => {
  try {
    await generateDatabase();
    await testConnection();
    await sincronizarProdutos();
    await sincronizarCupons();
    await sincronizarRecibos();
    await sincronizarVendas();

    app.listen(PORT, () => {
      console.log(
        `\u2728 PDV rodando em ${process.env.URL_PDV}:${process.env.PORT}`
      );
    });
  } catch (error) {
    console.error("Erro na inicialização:", error);
    process.exit(1);
  }
};

startServer();
