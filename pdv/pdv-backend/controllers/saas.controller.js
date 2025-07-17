const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { generateDatabase, testConnection } = require("../config/database");
const dotenv = require("dotenv");
dotenv.config();
// Controller para verificar se a assinatura do cliente está ativa
const verifySubscription = async (req, res) => {
  try {
    const { idcliente } = req.params;

    if (!idcliente) {
      return res.status(400).json({
        success: false,
        message: "ID do cliente não informado",
      });
    }

    // Chama o endpoint do outro backend para verificar a licença
    const url = `${process.env.SAAS_URL}/saas/pdv/verificar-licenca/${idcliente}`;
    // Faz a requisição para o backend SaaS
    const resposta = await axios.get(url);

    // Atualiza a tabela 'licenca' no banco de dados local com os dados retornados
    const { status, id } = resposta.data;

    // Atualiza o status e a data da última verificação no banco local
    const sqlite3 = require("sqlite3").verbose();
    const DB_PATH = path.join(__dirname, "../database/pdv.sqlite");

    const db = new sqlite3.Database(DB_PATH);
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE licenca SET id_saas_assinatura = ?, status = ?, ultima_verificacao = datetime('now') WHERE id = 1`,
        [id, status || "indefinido"],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    db.close();

    // Retorna a resposta do outro backend diretamente
    return res.status(resposta.status).json(resposta.data);
  } catch (err) {
    if (err.response) {
      // Erro retornado pelo outro backend
      return res.status(err.response.status).json({
        success: false,
        message:
          err.response.data?.message || "Erro ao verificar licença no SaaS",
      });
    }
    // Erro interno de comunicação
    console.error("Erro ao consultar licença no SaaS:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao consultar licença do cliente",
    });
  }
};

// Verifica se o banco local já existe
const verificarBancoExiste = async (req, res) => {
  try {
    const dbPath = path.join(__dirname, "../database/pdv.sqlite");
    const exists = fs.existsSync(dbPath);
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ exists: false, error: err.message });
  }
};

// Login local (cliente/parceiro)
const loginSaas = async (req, res) => {
  try {
    const { email, senha, cnpj } = req.body;
    // Decide tipo de login
    let loginPayload = { email, senha };
    let loginUrl = `${process.env.SAAS_URL}/saas/cliente/login`;
    if (cnpj) {
      loginPayload.cnpj = cnpj;
      loginUrl = `${process.env.SAAS_URL}/saas/parceiro-saas/login`;
    }
    // Faz login na API SaaS
    const resposta = await axios.post(loginUrl, loginPayload);
    if (resposta.data && resposta.data.token) {
      // Se login aceito, cria o banco local se não existir
      return res.json({
        success: true,
        user: resposta.data.user,
        token: resposta.data.token,
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Login inválido" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  verifySubscription,
  verificarBancoExiste,
  loginSaas,
};
