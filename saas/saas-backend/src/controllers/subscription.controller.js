const assasService = require("../services/assasService");
const { pool } = require("../config/database");

// Criar uma nova assinatura
const createSubscription = async (req, res) => {
  try {
    const { userId, planId, paymentData } = req.body;

    // Verifica se usuário existe
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Verifica se plano existe
    const plan = await pool.query("SELECT * FROM plano WHERE id = $1", [
      planId,
    ]);
    if (plan.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plano não encontrado",
      });
    }

    // Cria cliente na Assas (caso necessário)
    let assasCustomerId = user.rows[0].assasCustomerId;
    if (!assasCustomerId) {
      const customerData = {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        cpf: user.rows[0].cpf,
        cnpj: user.rows[0].cnpj,
        phone: user.rows[0].phone,
        address: user.rows[0].address,
        city: user.rows[0].city,
        state: user.rows[0].state,
        zipCode: user.rows[0].zipCode,
        country: user.rows[0].country,
      };
      const assasCustomer = await assasService.createCustomer(customerData);
      assasCustomerId = assasCustomer.id;
      await pool.query("UPDATE users SET assasCustomerId = $1 WHERE id = $2", [
        assasCustomerId,
        userId,
      ]);
    }

    // Cria assinatura na Assas
    const planData = {
      value: plan.rows[0].price,
      billingType: paymentData?.billingType || "CREDIT_CARD",
      nextDueDate: paymentData?.nextDueDate,
      cycle: plan.rows[0].cycle || "MONTHLY",
      description: plan.rows[0].description,
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
    const subscription = await pool.query(
      "INSERT INTO subscriptions (userId, planId, assasSubscriptionId, status, nextDueDate, value) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        userId,
        planId,
        assasSubscription.id,
        assasSubscription.status,
        assasSubscription.nextDueDate,
        assasSubscription.value,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Assinatura criada com sucesso",
      data: subscription.rows[0],
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
    const subscription = await pool.query(
      "SELECT * FROM subscriptions WHERE id = $1",
      [id]
    );

    if (subscription.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assinatura não encontrada",
      });
    }

    // Busca detalhes na Assas
    const assasData = await assasService.getSubscription(
      subscription.rows[0].assasSubscriptionId
    );

    res.json({
      success: true,
      data: {
        ...subscription.rows[0],
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
    const subscription = await pool.query(
      "SELECT * FROM subscriptions WHERE id = $1",
      [id]
    );

    if (subscription.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assinatura não encontrada",
      });
    }

    // Cancela na Assas
    await assasService.cancelSubscription(
      subscription.rows[0].assasSubscriptionId
    );

    // Atualiza status local
    await pool.query("UPDATE subscriptions SET status = $1 WHERE id = $2", [
      "CANCELLED",
      id,
    ]);

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
    const subscriptions = await pool.query(
      "SELECT * FROM subscriptions WHERE userId = $1",
      [userId]
    );

    res.json({
      success: true,
      data: subscriptions.rows,
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
      const localSubscription = await pool.query(
        "SELECT * FROM subscriptions WHERE assasSubscriptionId = $1",
        [subscription.id]
      );
      if (localSubscription.rows.length > 0) {
        // Atualizar status da assinatura
        await pool.query("UPDATE subscriptions SET status = $1 WHERE id = $2", [
          "active",
          localSubscription.rows[0].id,
        ]);
        // Atualizar usuário
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [
          localSubscription.rows[0].userId,
        ]);
        if (user.rows.length > 0) {
          await pool.query(
            "UPDATE users SET subscription_status = $1, is_trial_active = $2 WHERE id = $3",
            ["active", false, localSubscription.rows[0].userId]
          );
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
    const subscription = await pool.query(
      "SELECT * FROM subscriptions WHERE userId = $1 AND status = $2",
      [user.id, "active"]
    );
    res.json({
      success: true,
      data: {
        subscription_status: user.subscription_status,
        is_trial_active: user.is_trial_active,
        assinatura_ativa: subscription.rows.length > 0,
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
