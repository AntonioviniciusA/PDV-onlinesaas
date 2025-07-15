const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

const auth = async (req, res, next) => {
  let connection;
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de autenticação não fornecido",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM cliente WHERE id = ?",
      [decoded.userId]
    );
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

    // Função utilitária para trial (exemplo, ajuste conforme sua lógica real)
    user.isTrialActive = function () {
      // Exemplo: trial de 14 dias a partir do primeiro login
      if (!this.ultimo_login) return false;
      const trialDays = 14;
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

    console.error("Erro no middleware de autenticação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = auth;
