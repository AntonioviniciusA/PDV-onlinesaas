const assasService = require("../services/assasService");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Plan = require("../models/Plan.model");

// Criar uma nova assinatura
const createSubscription = async (req, res) => {
  try {
    const { userId, planId, paymentData } = req.body;

    // Verifica se usuário existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Verifica se plano existe
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plano não encontrado",
      });
    }

    // Cria cliente na Assas (caso necessário)
    let assasCustomerId = user.assasCustomerId;
    if (!assasCustomerId) {
      const customerData = {
        id: user.id,
        name: user.name,
        email: user.email,
        // Adicione outros campos necessários aqui
      };
      const assasCustomer = await assasService.createCustomer(customerData);
      assasCustomerId = assasCustomer.id;
      await user.update({ assasCustomerId });
    }

    // Cria assinatura na Assas
    const planData = {
      value: plan.price,
      billingType: paymentData?.billingType || "CREDIT_CARD",
      nextDueDate: paymentData?.nextDueDate,
      cycle: plan.cycle || "MONTHLY",
      description: plan.description,
      endDate: paymentData?.endDate,
      maxPayments: paymentData?.maxPayments,
      fine: paymentData?.fine,
      interest: paymentData?.interest,
      discount: paymentData?.discount,
      split: paymentData?.split,
    };

    const assasSubscription = await assasService.createSubscription(
      assasCustomerId,
      planData
    );

    // Salva assinatura no banco local
    const subscription = await Subscription.create({
      userId: user.id,
      planId: plan.id,
      assasSubscriptionId: assasSubscription.id,
      status: assasSubscription.status,
      nextDueDate: assasSubscription.nextDueDate,
      value: assasSubscription.value,
    });

    res.status(201).json({
      success: true,
      message: "Assinatura criada com sucesso",
      data: subscription,
    });
  } catch (error) {
    console.error("Erro ao criar assinatura:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar assinatura",
    });
  }
};

// Buscar assinatura por ID
const getSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Assinatura não encontrada",
      });
    }

    // Busca detalhes na Assas
    const assasData = await assasService.getSubscription(
      subscription.assasSubscriptionId
    );

    res.json({
      success: true,
      data: {
        ...subscription.toJSON(),
        assas: assasData,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar assinatura:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar assinatura",
    });
  }
};

// Cancelar assinatura
const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Assinatura não encontrada",
      });
    }

    // Cancela na Assas
    await assasService.cancelSubscription(subscription.assasSubscriptionId);

    // Atualiza status local
    await subscription.update({ status: "CANCELLED" });

    res.json({
      success: true,
      message: "Assinatura cancelada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao cancelar assinatura",
    });
  }
};

// Listar assinaturas de um usuário
const listUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const subscriptions = await Subscription.findAll({
      where: { userId },
      include: [{ model: Plan, as: "plan" }],
    });

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Erro ao listar assinaturas:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao listar assinaturas",
    });
  }
};

// Webhook da ASSAS
const webhook = async (req, res) => {
  try {
    const event = req.body.event;
    const payment = req.body.payment;
    const subscription = req.body.subscription;

    if (event === "PAYMENT_CONFIRMED" && subscription) {
      // Encontrar assinatura local
      const localSubscription = await Subscription.findOne({
        where: { assas_subscription_id: subscription.id },
      });
      if (localSubscription) {
        // Atualizar status da assinatura
        await localSubscription.update({ status: "active" });
        // Atualizar usuário
        const user = await User.findByPk(localSubscription.user_id);
        if (user) {
          await user.update({
            subscription_status: "active",
            is_trial_active: false,
          });
        }
      }
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro no webhook da Assas:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao processar webhook" });
  }
};

// Status da assinatura do usuário autenticado
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = req.user;
    const subscription = await Subscription.findOne({
      where: { user_id: user.id, status: "active" },
    });
    res.json({
      success: true,
      data: {
        subscription_status: user.subscription_status,
        is_trial_active: user.is_trial_active,
        assinatura_ativa: !!subscription,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao obter status da assinatura" });
  }
};

module.exports = {
  createSubscription,
  getSubscription,
  cancelSubscription,
  listUserSubscriptions,
  webhook,
  getSubscriptionStatus,
};
