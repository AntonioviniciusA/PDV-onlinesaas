const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database.js");

const JWT_SECRET = process.env.JWT_SECRET;

// Registro de parceiro SaaS
const registerParceiro = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      cpf,
      telefone,
      empresa,
      cnpj,
      endereco,
      cidade,
      estado,
      cep,
    } = req.body;
    if (
      !nome ||
      !email ||
      !senha ||
      !cpf ||
      !telefone ||
      !empresa ||
      !cnpj ||
      !endereco ||
      !cidade ||
      !estado ||
      !cep
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos obrigatórios devem ser preenchidos.",
      });
    }
    // Verifica se já existe parceiro com o mesmo email, cpf ou cnpj
    const [parceiroExistente] = await pool.query(
      "SELECT * FROM parceiro_saas WHERE email = ? OR cpf = ? OR cnpj = ?",
      [email, cpf, cnpj]
    );
    if (parceiroExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: "E-mail, CPF ou CNPJ já cadastrado.",
      });
    }
    // Criptografa a senha
    const hashSenha = await bcrypt.hash(senha, 10);
    // Cria novo parceiro
    const id = uuidv4();
    await pool.query(
      `INSERT INTO parceiro_saas 
        (id, nome, email, senha, cpf, telefone, empresa, cnpj, endereco, cidade, estado, cep, ativo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
      [
        id,
        nome,
        email,
        hashSenha,
        cpf,
        telefone,
        empresa,
        cnpj,
        endereco,
        cidade,
        estado,
        cep,
      ]
    );
    return res.status(201).json({
      success: true,
      message: "Parceiro SaaS cadastrado com sucesso.",
    });
  } catch (err) {
    console.error("Erro no registro de parceiro SaaS:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao registrar parceiro SaaS.",
    });
  }
};

// Login de parceiro SaaS
const loginParceiro = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: "E-mail e senha são obrigatórios.",
      });
    }
    // Busca parceiro pelo email
    const [parceiroRows] = await pool.query(
      "SELECT * FROM parceiro_saas WHERE email = ?",
      [email]
    );
    if (parceiroRows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }
    const parceiro = parceiroRows[0];
    // Compara senha
    const senhaCorreta = await bcrypt.compare(senha, parceiro.senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }
    // Gera token JWT
    const token = jwt.sign(
      {
        id: parceiro.id,
        email: parceiro.email,
        nome: parceiro.nome,
        tipo: "parceiro_saas",
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );
    // Atualiza último login
    await pool.query(
      "UPDATE parceiro_saas SET ultimo_login = NOW() WHERE id = ?",
      [parceiro.id]
    );
    // Retorna dados do parceiro (sem senha)
    return res.json({
      success: true,
      token,
      user: {
        id: parceiro.id,
        nome: parceiro.nome,
        email: parceiro.email,
        cpf: parceiro.cpf,
        telefone: parceiro.telefone,
        empresa: parceiro.empresa,
        cnpj: parceiro.cnpj,
        endereco: parceiro.endereco,
        cidade: parceiro.cidade,
        estado: parceiro.estado,
        cep: parceiro.cep,
        ativo: parceiro.ativo,
      },
    });
  } catch (err) {
    console.error("Erro no login de parceiro SaaS:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao fazer login.",
    });
  }
};

module.exports = {
  registerParceiro,
  loginParceiro,
};
