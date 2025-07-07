const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    assas_subscription_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ID da assinatura na ASSAS",
    },
    assas_customer_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ID do cliente na ASSAS",
    },
    plan_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Nome do plano contratado",
    },
    plan_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Preço do plano",
    },
    billing_cycle: {
      type: DataTypes.ENUM("monthly", "yearly"),
      allowNull: false,
      defaultValue: "monthly",
      comment: "Ciclo de cobrança",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "cancelled", "overdue"),
      defaultValue: "active",
      comment: "Status da assinatura",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Data de término (para assinaturas canceladas)",
    },
    next_billing_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Próxima data de cobrança",
    },
    last_payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Data do último pagamento",
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Método de pagamento",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "subscriptions",
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["assas_subscription_id"],
        unique: true,
      },
      {
        fields: ["status"],
      },
    ],
  }
);

// Método para verificar se a assinatura está ativa
Subscription.prototype.isActive = function () {
  return this.is_active && this.status === "active";
};

// Método para verificar se a assinatura está vencida
Subscription.prototype.isOverdue = function () {
  return (
    this.status === "overdue" ||
    (this.next_billing_date && new Date() > this.next_billing_date)
  );
};

// Método para calcular próxima data de cobrança
Subscription.prototype.calculateNextBilling = function () {
  const currentDate = new Date();
  const nextDate = new Date(currentDate);

  if (this.billing_cycle === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (this.billing_cycle === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return nextDate;
};

module.exports = Subscription;
