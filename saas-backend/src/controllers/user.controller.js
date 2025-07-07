// Controlador de usuário básico para listar e buscar usuários

const User = require("../models/User");

// Listar todos os usuários
const listUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao listar usuários",
    });
  }
};

// Buscar usuário por ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário",
    });
  }
};

// Perfil do usuário autenticado
const getProfile = async (req, res) => {
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

// Atualizar perfil do usuário autenticado
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar perfil" });
  }
};

// Trocar senha do usuário autenticado
const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    const isMatch = await user.checkPassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Senha atual incorreta" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Senha alterada com sucesso" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao alterar senha" });
  }
};

// Verificar status de acesso do usuário
const checkAccessStatus = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        hasAccess: user.hasAccess(),
        isTrialActive: user.isTrialActive(),
        subscription_status: user.subscription_status,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao verificar status de acesso" });
  }
};

module.exports = {
  listUsers,
  getUserById,
  getProfile,
  updateProfile,
  changePassword,
  checkAccessStatus,
};
