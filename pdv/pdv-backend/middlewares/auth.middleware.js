const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

const auth = async (req, res, next) => {
  let connection;
  try {
    // Busca o token do cookie
    const token = req.cookies.token;
    console.log("middleware", token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de autenticação não fornecido",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM users WHERE id = ?", [
      decoded.id,
    ]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: "Usuário inativo",
      });
    }
    user.isTrialActive = function () {
      if (!this.ultimo_login) return false;
      const trialDays = 7;
      const start = new Date(this.ultimo_login);
      const now = new Date();
      const diff = (now - start) / (1000 * 60 * 60 * 24);
      return diff <= trialDays;
    };
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = auth;
