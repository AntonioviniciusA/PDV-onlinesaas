// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser"); // Adicionado cookie-parser
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

app.use(cors(corsOptions));
app.use(cookieParser()); // Usar cookie-parser logo após o CORS

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware simples de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
// app.use(express.static(path.join(__dirname, "client/build")));

// // Rota fallback para React (SPA)
// // app.get("*", (req, res) => {
// //   res.sendFile(path.join(__dirname, "client/build", "index.html"));
// // });

// Rotas
app.use("/local", require("./routers/router.js"));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client/build", "index.html"));
// });
if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    try {
      await generateDatabase();
      await testConnection();
      // await sincronizarProdutos();
      // await sincronizarCupons();
      // await sincronizarRecibos();
      // await sincronizarVendas();

      app.listen(PORT, () => {
        console.log(
          `\u2728 PDV rodando em ${process.env.PDV_URL}:${process.env.PORT}`
        );
      });
    } catch (error) {
      console.error("Erro na inicialização:", error);
      process.exit(1);
    }
  };
  startServer();
}

module.exports = app;
