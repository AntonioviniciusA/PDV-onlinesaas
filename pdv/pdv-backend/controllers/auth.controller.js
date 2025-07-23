const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  console.log("login");
  let connection;
  try {
    connection = await pool.getConnection();
    const { entrada } = req.body;
    if (!entrada || !entrada.includes(".")) {
      return res.status(400).json({
        success: false,
        message: "Formato inválido: esperado 'id.senha'",
      });
    }
    const [id, senha] = entrada.split(".");
    const [usersRows] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    if (usersRows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não encontrado." });
    }
    const senhaValida = await bcrypt.compare(senha.trim(), usersRows[0].senha);
    if (!senhaValida) {
      return res
        .status(401)
        .json({ success: false, message: "Senha incorreta." });
    }
    // Padronizar permissions para array
    let permissions = usersRows[0].permissions;
    if (typeof permissions === "string") {
      try {
        permissions = JSON.parse(permissions);
      } catch (e) {
        permissions = [];
      }
    }
    const token = jwt.sign(
      {
        id: usersRows[0].id,
        permissions: permissions,
        email: usersRows[0].email,
        nome: usersRows[0].nome,
        perfil: usersRows[0].perfil,
        ativo: usersRows[0].ativo,
        ultimo_login: usersRows[0].ultimo_login,
        created_at: usersRows[0].created_at,
        updated_at: usersRows[0].updated_at,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );
    connection.release();
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
    return res.json({
      success: true,
      user: {
        id: usersRows[0].id,
        nome: usersRows[0].nome,
        email: usersRows[0].email,
        perfil: usersRows[0].perfil,
        permissions: permissions,
      },
    });
  } catch (error) {
    if (connection) connection.release();
    return res
      .status(500)
      .json({ success: false, message: "Erro ao realizar login." });
  }
};

// Novo endpoint para retornar o usuário autenticado
const me = (req, res) => {
  console.log("me");
  const cookies = req.cookies || {};
  const token = cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Não autenticado" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = decoded;
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Não autenticado" });
  }
  res.json({ user: req.user });
};

const logout = async (req, res) => {
  console.log("logout");
  res.clearCookie("token");
  res.json({ success: true, message: "Logout realizado com sucesso." });
};

module.exports = {
  login,
  me,
  logout,
};
