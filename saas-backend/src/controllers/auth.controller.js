const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const moment = require("moment");

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Cadastro de usuário com avaliação gratuita
const register = async (req, res) => {
  try {
    // Verificar se o trial está ativado
    if (process.env.FREE_TRIAL_ENABLED !== "true") {
      return res.status(403).json({
        success: false,
        message:
          "Cadastro desativado. O período de avaliação gratuita não está disponível no momento.",
      });
    }
    // Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Verificar se o email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email já cadastrado",
      });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
    });

    // Gerar token
    const token = generateToken(user.id);

    // Atualizar último login
    await user.update({ lastLogin: new Date() });

    res.status(201).json({
      success: true,
      message:
        "Usuário cadastrado com sucesso! Você tem 3 dias de avaliação gratuita.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          trialStartDate: user.trialStartDate,
          trialEndDate: user.trialEndDate,
          isTrialActive: user.isTrialActive,
          subscriptionStatus: user.subscriptionStatus,
        },
        token,
        trialDays: parseInt(process.env.FREE_TRIAL_DAYS) || 3,
      },
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Login de usuário
const login = async (req, res) => {
  try {
    // Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha inválidos",
      });
    }

    // Verificar senha
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha inválidos",
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Usuário inativo",
      });
    }

    // Gerar token
    const token = generateToken(user.id);

    // Atualizar último login
    await user.update({ lastLogin: new Date() });

    // Verificar status do acesso
    const hasAccess = user.hasAccess();
    const isInTrial = user.isInTrialPeriod();
    const trialExpired = user.isTrialExpired();

    res.json({
      success: true,
      message: "Login realizado com sucesso",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          trialStartDate: user.trialStartDate,
          trialEndDate: user.trialEndDate,
          isTrialActive: user.isTrialActive,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionEndDate: user.subscriptionEndDate,
        },
        token,
        access: {
          hasAccess,
          isInTrial,
          trialExpired,
          trialDaysRemaining: isInTrial
            ? Math.ceil(
                (new Date(user.trialEndDate) - new Date()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Obter perfil do usuário
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    const hasAccess = user.hasAccess();
    const isInTrial = user.isInTrialPeriod();
    const trialExpired = user.isTrialExpired();

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          trialStartDate: user.trialStartDate,
          trialEndDate: user.trialEndDate,
          isTrialActive: user.isTrialActive,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionStartDate: user.subscriptionStartDate,
          subscriptionEndDate: user.subscriptionEndDate,
          lastLogin: user.lastLogin,
        },
        access: {
          hasAccess,
          isInTrial,
          trialExpired,
          trialDaysRemaining: isInTrial
            ? Math.ceil(
                (new Date(user.trialEndDate) - new Date()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao obter perfil:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Verificar status do acesso
const checkAccess = async (req, res) => {
  try {
    const user = req.user;

    const hasAccess = user.hasAccess();
    const isInTrial = user.isInTrialPeriod();
    const trialExpired = user.isTrialExpired();

    res.json({
      success: true,
      data: {
        hasAccess,
        isInTrial,
        trialExpired,
        trialDaysRemaining: isInTrial
          ? Math.ceil(
              (new Date(user.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)
            )
          : 0,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar acesso:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Logout de usuário
const logout = async (req, res) => {
  // Para JWT stateless, apenas oriente o frontend a apagar o token
  res.json({ success: true, message: "Logout realizado com sucesso" });
};

// Perfil do usuário autenticado
const me = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        trial_expires_at: user.trial_expires_at,
        is_trial_active: user.is_trial_active,
        subscription_status: user.subscription_status,
        last_login: user.last_login,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao obter perfil" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  checkAccess,
  logout,
  me,
};
