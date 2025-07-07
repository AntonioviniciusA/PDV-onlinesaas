const Subscription = require("../models/Subscription");

// Middleware para verificar se o usuário tem acesso (trial ou assinatura ativa)
const checkAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    // Verificar se a avaliação gratuita ainda está ativa
    if (req.user.isTrialActive()) {
      return next();
    }

    // Se a avaliação gratuita expirou, verificar se tem assinatura ativa
    if (req.user.subscription_status === "active") {
      // Buscar assinatura ativa no banco
      const activeSubscription = await Subscription.findOne({
        where: {
          user_id: req.user.id,
          status: "active",
          is_active: true,
        },
      });

      if (activeSubscription && activeSubscription.isActive()) {
        return next();
      }
    }

    // Se chegou aqui, não tem acesso
    return res.status(403).json({
      success: false,
      message:
        "Acesso negado. Sua avaliação gratuita expirou e você não possui uma assinatura ativa.",
      trialExpired: !req.user.isTrialActive(),
      subscriptionStatus: req.user.subscription_status,
      requiresSubscription: true,
    });
  } catch (error) {
    console.error("Erro ao verificar acesso:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Middleware para verificar se a avaliação gratuita expirou
const checkTrialExpired = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    // Se a avaliação gratuita ainda está ativa, permitir acesso
    if (req.user.isTrialActive()) {
      return next();
    }

    // Se a avaliação gratuita expirou, verificar se tem assinatura ativa
    if (req.user.subscription_status === "active") {
      const activeSubscription = await Subscription.findOne({
        where: {
          user_id: req.user.id,
          status: "active",
          is_active: true,
        },
      });

      if (activeSubscription && activeSubscription.isActive()) {
        return next();
      }
    }

    // Se chegou aqui, a avaliação gratuita expirou e não tem assinatura ativa
    return res.status(403).json({
      success: false,
      message:
        "Sua avaliação gratuita expirou. É necessário assinar um plano para continuar.",
      trialExpired: true,
      subscriptionStatus: req.user.subscription_status,
      requiresSubscription: true,
    });
  } catch (error) {
    console.error("Erro ao verificar expiração da avaliação gratuita:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

module.exports = {
  checkAccess,
  checkTrialExpired,
};
