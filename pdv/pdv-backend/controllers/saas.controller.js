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
    let loginPayload = { email, senha };
    let loginUrl = `${process.env.SAAS_URL}/saas/cliente/login`;
    if (cnpj) {
      loginPayload.cnpj = cnpj;
      loginUrl = `${process.env.SAAS_URL}/saas/parceiro-saas/login`;
    }
    const retorno = await axios.post(loginUrl, loginPayload);
    console.log("retorno loginSaas", retorno.data);
    if (retorno.data && retorno.data.token) {
      res.cookie("token_saas", retorno.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });
      // Seta o tipo de usuário SaaS
      res.cookie("saasTipo", cnpj ? "parceiro" : "cliente", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });
      return res.json({
        success: true,
        user: retorno.data.user,
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

// Novo endpoint para retornar o usuário autenticado do SaaS
const meSaas = async (req, res) => {
  const cookies = req.cookies || {};
  const token = cookies.token_saas;
  const tipo = cookies.saasTipo;
  console.log("meSaas cookies", cookies);
  console.log("meSaas token", token);
  if (!token) {
    return res.status(401).json({ success: false, message: "Não autenticado" });
  }
  try {
    let url = `${process.env.SAAS_URL}/saas/cliente/me`;
    if (tipo === "parceiro") {
      url = `${process.env.SAAS_URL}/saas/parceiro-saas/me`;
    }
    const resposta = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("resposta meSaas", resposta.data);
    if (!resposta.data || !resposta.data.user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });
    }
    return res.json({ success: true, user: resposta.data.user });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
};

module.exports = {
  verifySubscription,
  verificarBancoExiste,
  loginSaas,
  meSaas,
};
