const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    trial_expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Data de expiração da avaliação gratuita",
    },
    is_trial_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Se a avaliação gratuita ainda está ativa",
    },
    subscription_status: {
      type: DataTypes.ENUM("trial", "active", "inactive", "cancelled"),
      defaultValue: "trial",
      comment: "Status da assinatura do usuário",
    },
    assas_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID do cliente na ASSAS",
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        // Hash da senha
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }

        // Definir data de expiração da avaliação gratuita (3 dias)
        const trialDays = parseInt(process.env.FREE_TRIAL_DAYS) || 3;
        user.trial_expires_at = new Date(
          Date.now() + trialDays * 24 * 60 * 60 * 1000
        );
      },
      beforeUpdate: async (user) => {
        // Hash da senha apenas se foi alterada
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

// Método para verificar senha
User.prototype.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Método para verificar se a avaliação gratuita ainda está ativa
User.prototype.isTrialActive = function () {
  return this.is_trial_active && new Date() < this.trial_expires_at;
};

// Método para verificar se o usuário tem acesso ao sistema
User.prototype.hasAccess = function () {
  return (
    this.is_active &&
    (this.isTrialActive() || this.subscription_status === "active")
  );
};

module.exports = User;
