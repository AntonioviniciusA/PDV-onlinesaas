const { pool } = require("../config/database");

// Middleware para verificar se o usuário tem acesso (trial ou assinatura ativa)
const checkAccess = async (req, res, next) => {
  let connection;
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    // Verificar se a avaliação gratuita ainda está ativa
    if (
      typeof req.user.isTrialActive === "function" &&
      req.user.isTrialActive()
    ) {
      return next();
    }

    // Se a avaliação gratuita expirou, verificar se tem assinatura ativa
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM assinaturas WHERE id_usuario = ? AND status = 'active' AND data_fim > NOW() LIMIT 1",
      [req.user.id]
    );
    const activeSubscription = rows[0];

    if (activeSubscription) {
      return next();
    }

    // Se chegou aqui, não tem acesso
    return res.status(403).json({
      success: false,
      message:
        "Acesso negado. Sua avaliação gratuita expirou e você não possui uma assinatura ativa.",
      trialExpired: !(
        typeof req.user.isTrialActive === "function" && req.user.isTrialActive()
      ),
      requiresSubscription: true,
    });
  } catch (error) {
    console.error("Erro ao verificar acesso:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  } finally {
    if (connection) await connection.release();
  }
};

// Middleware para verificar se a avaliação gratuita expirou
const checkTrialExpired = async (req, res, next) => {
  let connection;
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    // Se a avaliação gratuita ainda está ativa, permitir acesso
    if (
      typeof req.user.isTrialActive === "function" &&
      req.user.isTrialActive()
    ) {
      return next();
    }

    // Se a avaliação gratuita expirou, verificar se tem assinatura ativa
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM assinaturas WHERE id_usuario = ? AND status = 'active' AND data_fim > NOW() LIMIT 1",
      [req.user.id]
    );
    const activeSubscription = rows[0];

    if (activeSubscription) {
      return next();
    }

    // Se chegou aqui, a avaliação gratuita expirou e não tem assinatura ativa
    return res.status(403).json({
      success: false,
      message:
        "Sua avaliação gratuita expirou. É necessário assinar um plano para continuar.",
      trialExpired: true,
      requiresSubscription: true,
    });
  } catch (error) {
    console.error("Erro ao verificar expiração da avaliação gratuita:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  checkAccess,
  checkTrialExpired,
};
