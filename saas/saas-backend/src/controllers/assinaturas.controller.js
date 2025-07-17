const assasService = require("../services/assasService");
const { pool } = require("../config/database");
const { v4: uuidv4 } = require("uuid");

// Criar uma nova assinatura
const createassinaturas = async (req, res) => {
  try {
    const { planId, paymentData } = req.body;
    const userId = req.user.id;

    // Verifica se usuário existe
    const [cliente] = await pool.query("SELECT * FROM cliente WHERE id = ?", [
      userId,
    ]);
    // console.log("cliente", cliente);
    if (cliente.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }
    // Verifica se plano existe
    // console.log("planId", planId);
    const [plans] = await pool.query("SELECT * FROM plano WHERE id = ?", [
      planId,
    ]);
    //  console.log("plans", plans);
    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plano não encontrado",
      });
    }

    // Cria cliente na Assas (caso necessário)
    let assasCustomerId = cliente[0].assas_id_cliente;
    if (!assasCustomerId) {
      const customerData = {
        id: cliente[0].id,
        name: cliente[0].nome_representante,
        email: cliente[0].email,
        cpf: cliente[0].cpf,
        cnpj: cliente[0].cnpj,
        mobilePhone: cliente[0].telefone,
        address: cliente[0].endereco,
        city: cliente[0].cidade,
        state: cliente[0].estado,
        zipCode: cliente[0].cep,
        country: cliente[0].pais,
      };
      // console.log("customerData", customerData);
      const assasCustomer = await assasService.createCustomer(customerData);
      // console.log("assasCustomer", assasCustomer);
      assasCustomerId = assasCustomer.id;
      await pool.query("UPDATE cliente SET assas_id_cliente = ? WHERE id = ?", [
        assasCustomerId,
        userId,
      ]);
    }

    // Calcular nextDueDate para hoje + 7 dias
    const today = new Date();
    const nextDueDate = new Date(today.setDate(today.getDate() + 7))
      .toISOString()
      .slice(0, 10); // formato YYYY-MM-DD
    // nextDueDate já está no formato YYYY-MM-DD (string), converter para Date para calcular data_fim
    const nextDueDateDate = new Date(nextDueDate);
    const data_fim = new Date(
      nextDueDateDate.setDate(nextDueDateDate.getDate() + 30)
    )
      .toISOString()
      .slice(0, 10); // formato YYYY-MM-DD
    // console.log("data_fim", data_fim);
    // Corrigir valores para a API da Asaas
    let cycle = plans[0].ciclo_cobranca || "MONTHLY";
    if (cycle.toLowerCase() === "monthly") cycle = "MONTHLY";
    else if (
      cycle.toLowerCase() === "annual" ||
      cycle.toLowerCase() === "anual" ||
      cycle.toLowerCase() === "yearly"
    )
      cycle = "ANNUAL";
    else cycle = "MONTHLY";

    let billingType = (paymentData?.billingType || "CREDIT_CARD").toUpperCase();
    if (billingType === "CARD") billingType = "CREDIT_CARD";
    if (!["CREDIT_CARD", "BOLETO", "PIX"].includes(billingType))
      billingType = "CREDIT_CARD";

    const planData = {
      value: Number(plans[0].preco),
      billingType,
      nextDueDate,
      cycle,
      description: plans[0].descricao,
      endDate: data_fim,
      maxPayments: paymentData?.maxPayments,
      fine: paymentData?.fine,
      interest: paymentData?.interest,
      discount: paymentData?.discount,
      split: paymentData?.split,
    };
    // Chamar a criação de assinatura na Assas
    const assasassinaturas = await assasService.createassinaturas(
      assasCustomerId,
      planData
    );
    console.log("assasassinaturas", assasassinaturas);
    // Salva assinatura no banco local
    const id = uuidv4();

    const [assinaturas] = await pool.query(
      "INSERT INTO assinaturas (id, id_cliente, id_plano, assas_id_cliente, assas_id_assinatura, ciclo_cobranca, status, data_cobranca, data_inicio, data_fim, valor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        userId,
        planId,
        assasCustomerId,
        assasassinaturas.id,
        assasassinaturas.cycle,
        assasassinaturas.status,
        assasassinaturas.nextDueDate,
        today,
        data_fim,
        assasassinaturas.value,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Assinatura criada com sucesso",
      data: assinaturas,
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
const getassinaturas = async (req, res) => {
  try {
    const { id } = req.params;
    const [assinaturas] = await pool.query(
      "SELECT * FROM assinaturas WHERE id = ?",
      [id]
    );

    if (assinaturas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assinatura não encontrada",
      });
    }

    // Busca detalhes na Assas
    const assasData = await assasService.getassinaturas(
      assinaturas[0].assasassinaturasId
    );

    res.json({
      success: true,
      data: {
        ...assinaturas[0],
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
const cancelassinaturas = async (req, res) => {
  try {
    const { id } = req.params;
    const [assinaturas] = await pool.query(
      "SELECT * FROM assinaturas WHERE id = ?",
      [id]
    );
    console.log("assinaturas", assinaturas);
    if (assinaturas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assinatura não encontrada",
      });
    }

    // Cancela na Assas
    const assasassinaturas = await assasService.cancelassinaturas(
      assinaturas[0].assas_id_assinatura
    );
    console.log("assasassinaturas", assasassinaturas);

    // Atualiza status local
    const assinaturasCancelada = await pool.query(
      "DELETE FROM assinaturas WHERE id = ?",
      [id]
    );
    console.log("assinaturasCancelada", assinaturasCancelada);

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
const listUserassinaturas = async (req, res) => {
  try {
    const userId = req.user.id;
    // Join com a tabela de planos para trazer nome do plano e outros dados
    const [assinaturas] = await pool.query(
      `SELECT a.*, p.nome as nome_plano, p.descricao as descricao_plano, p.preco as preco_plano
       FROM assinaturas a
       LEFT JOIN plano p ON a.id_plano = p.id
       WHERE a.id_cliente = ?`,
      [userId]
    );
    res.json({
      success: true,
      data: assinaturas,
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
    const assinaturas = req.body.assinaturas;

    if (event === "PAYMENT_CONFIRMED" && assinaturas) {
      // Encontrar assinatura local
      const [localassinaturas] = await pool.query(
        "SELECT * FROM assinaturas WHERE assasassinaturasId = ?",
        [assinaturas.id]
      );
      if (localassinaturas.length > 0) {
        // Atualizar status da assinatura
        await pool.query("UPDATE assinaturas SET status = ? WHERE id = ?", [
          "active",
          localassinaturas[0].id,
        ]);
        // Atualizar usuário
        const [cliente] = await pool.query(
          "SELECT * FROM cliente WHERE id = ?",
          [localassinaturas[0].id_cliente]
        );
        if (cliente.length > 0) {
          await pool.query(
            "UPDATE cliente SET assinaturas_status = ?, is_trial_active = ? WHERE id = ?",
            ["active", false, localassinaturas[0].id_cliente]
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
const getassinaturastatus = async (req, res) => {
  try {
    const user = req.user;
    const [assinaturas] = await pool.query(
      "SELECT * FROM assinaturas WHERE id_cliente = ? AND status = ?",
      [user.id, "active"]
    );
    res.json({
      success: true,
      data: {
        assinaturas_status: user.assinaturas_status,
        is_trial_active: user.is_trial_active,
        assinatura_ativa: assinaturas.length > 0,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao obter status da assinatura" });
  }
};

// Buscar condições do plano de uma assinatura
const getPlanoCondicoesByAssinatura = async (req, res) => {
  try {
    const { id } = req.params;
    // Buscar assinatura
    const [assinaturas] = await pool.query(
      "SELECT * FROM assinaturas WHERE id = ?",
      [id]
    );
    if (!assinaturas || assinaturas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assinatura não encontrada",
      });
    }
    const assinatura = assinaturas[0];
    // Buscar plano relacionado
    const [planos] = await pool.query("SELECT * FROM plano WHERE id = ?", [
      assinatura.id_plano,
    ]);
    if (!planos || planos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plano não encontrado",
      });
    }
    const plano = planos[0];
    // Converter funcionalidades de JSON string para array
    let funcionalidades = plano.funcionalidades;
    try {
      funcionalidades = JSON.parse(plano.funcionalidades);
    } catch (e) {}
    res.json({
      success: true,
      plano: {
        ...plano,
        funcionalidades,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar condições do plano da assinatura:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar condições do plano da assinatura",
    });
  }
};

module.exports = {
  createassinaturas,
  getassinaturas,
  cancelassinaturas,
  listUserassinaturas,
  webhook,
  getassinaturastatus,
  getPlanoCondicoesByAssinatura, // nova função exportada
};
