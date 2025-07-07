const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Plan = sequelize.define(
  "Plan",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Nome do plano (Básico, Profissional, Empresarial)",
    },
    billing_cycle: {
      type: DataTypes.ENUM("monthly", "yearly"),
      allowNull: false,
      comment: "Ciclo de cobrança",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Preço do plano",
    },
    price_display: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Preço formatado para exibição (ex: R$ 90)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Descrição do plano",
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Número máximo de usuários (-1 para ilimitado)",
    },
    storage_limit_gb: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Limite de armazenamento em GB (-1 para ilimitado)",
    },
    analytics_level: {
      type: DataTypes.ENUM("basic", "advanced", "custom"),
      allowNull: false,
      defaultValue: "basic",
      comment: "Nível de analytics disponível",
    },
    support_level: {
      type: DataTypes.ENUM("email", "priority_email", "phone_24_7"),
      allowNull: false,
      defaultValue: "email",
      comment: "Nível de suporte",
    },
    api_access: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Se tem acesso à API",
    },
    api_access_level: {
      type: DataTypes.ENUM("none", "basic", "advanced"),
      defaultValue: "none",
      comment: "Nível de acesso à API",
    },
    custom_integrations: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Se permite integrações personalizadas",
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: "Lista de features do plano em formato JSON",
    },
    is_popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Se é o plano mais popular",
    },
    cta_text: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Teste Grátis",
      comment: "Texto do botão de call-to-action",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Se o plano está ativo",
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Ordem de exibição dos planos",
    },
  },
  {
    tableName: "plans",
    indexes: [
      {
        fields: ["billing_cycle"],
      },
      {
        fields: ["is_active"],
      },
      {
        fields: ["sort_order"],
      },
    ],
  }
);

// Método para verificar se o plano tem usuários ilimitados
Plan.prototype.hasUnlimitedUsers = function () {
  return this.max_users === -1;
};

// Método para verificar se o plano tem armazenamento ilimitado
Plan.prototype.hasUnlimitedStorage = function () {
  return this.storage_limit_gb === -1;
};

// Método para obter features como array
Plan.prototype.getFeaturesArray = function () {
  return Array.isArray(this.features) ? this.features : [];
};

// Método para verificar se o plano suporta um número específico de usuários
Plan.prototype.supportsUsers = function (userCount) {
  return this.hasUnlimitedUsers() || userCount <= this.max_users;
};

// Método para verificar se o plano suporta um volume específico de armazenamento
Plan.prototype.supportsStorage = function (storageGB) {
  return this.hasUnlimitedStorage() || storageGB <= this.storage_limit_gb;
};

module.exports = Plan;
