const Plan = require("../models/Plan.model");
const { sequelize } = require("./database");

const plansData = [
  // Planos Mensais
  {
    name: "Básico",
    billing_cycle: "monthly",
    price: 90.0,
    price_display: "R$ 90",
    description: "Perfeito para pequenas empresas e startups.",
    max_users: 5,
    storage_limit_gb: 5,
    analytics_level: "basic",
    support_level: "email",
    api_access: false,
    api_access_level: "none",
    custom_integrations: false,
    features: [
      "Até 5 usuários",
      "Analytics básico",
      "5GB de armazenamento",
      "Suporte por email",
    ],
    is_popular: false,
    cta_text: "Teste Grátis",
    sort_order: 1,
  },
  {
    name: "Profissional",
    billing_cycle: "monthly",
    price: 120.0,
    price_display: "R$ 120",
    description: "Ideal para empresas em crescimento.",
    max_users: 20,
    storage_limit_gb: 25,
    analytics_level: "advanced",
    support_level: "priority_email",
    api_access: true,
    api_access_level: "basic",
    custom_integrations: false,
    features: [
      "Até 20 usuários",
      "Analytics avançado",
      "25GB de armazenamento",
      "Suporte prioritário por email",
      "Acesso à API",
    ],
    is_popular: true,
    cta_text: "Teste Grátis",
    sort_order: 2,
  },
  {
    name: "Empresarial",
    billing_cycle: "monthly",
    price: 199.0,
    price_display: "R$ 199",
    description: "Para grandes organizações com necessidades complexas.",
    max_users: -1, // Ilimitado
    storage_limit_gb: -1, // Ilimitado
    analytics_level: "custom",
    support_level: "phone_24_7",
    api_access: true,
    api_access_level: "advanced",
    custom_integrations: true,
    features: [
      "Usuários ilimitados",
      "Analytics personalizado",
      "Armazenamento ilimitado",
      "Suporte 24/7 por telefone e email",
      "Acesso avançado à API",
      "Integrações personalizadas",
    ],
    is_popular: false,
    cta_text: "Falar com Vendas",
    sort_order: 3,
  },

  // Planos Anuais
  {
    name: "Básico",
    billing_cycle: "yearly",
    price: 60.0,
    price_display: "R$ 60",
    description: "Perfeito para pequenas empresas e startups.",
    max_users: 5,
    storage_limit_gb: 5,
    analytics_level: "basic",
    support_level: "email",
    api_access: false,
    api_access_level: "none",
    custom_integrations: false,
    features: [
      "Até 5 usuários",
      "Analytics básico",
      "5GB de armazenamento",
      "Suporte por email",
    ],
    is_popular: false,
    cta_text: "Teste Grátis",
    sort_order: 4,
  },
  {
    name: "Profissional",
    billing_cycle: "yearly",
    price: 90.0,
    price_display: "R$ 90",
    description: "Ideal para empresas em crescimento.",
    max_users: 20,
    storage_limit_gb: 25,
    analytics_level: "advanced",
    support_level: "priority_email",
    api_access: true,
    api_access_level: "basic",
    custom_integrations: false,
    features: [
      "Até 20 usuários",
      "Analytics avançado",
      "25GB de armazenamento",
      "Suporte prioritário por email",
      "Acesso à API",
    ],
    is_popular: true,
    cta_text: "Teste Grátis",
    sort_order: 5,
  },
  {
    name: "Empresarial",
    billing_cycle: "yearly",
    price: 150.0,
    price_display: "R$ 150",
    description: "Para grandes organizações com necessidades complexas.",
    max_users: -1, // Ilimitado
    storage_limit_gb: -1, // Ilimitado
    analytics_level: "custom",
    support_level: "phone_24_7",
    api_access: true,
    api_access_level: "advanced",
    custom_integrations: true,
    features: [
      "Usuários ilimitados",
      "Analytics personalizado",
      "Armazenamento ilimitado",
      "Suporte 24/7 por telefone e email",
      "Acesso avançado à API",
      "Integrações personalizadas",
    ],
    is_popular: false,
    cta_text: "Falar com Vendas",
    sort_order: 6,
  },
];

const seedPlans = async () => {
  try {
    console.log("🌱 Iniciando seed dos planos...");

    // Verificar se já existem planos
    const existingPlans = await Plan.count();

    if (existingPlans > 0) {
      console.log("✅ Planos já existem no banco de dados.");
      return;
    }

    // Criar todos os planos
    await Plan.bulkCreate(plansData);

    console.log(`✅ ${plansData.length} planos criados com sucesso!`);
    console.log("📊 Planos disponíveis:");

    const createdPlans = await Plan.findAll({
      order: [
        ["billing_cycle", "ASC"],
        ["sort_order", "ASC"],
      ],
    });

    createdPlans.forEach((plan) => {
      console.log(
        `   - ${plan.name} (${plan.billing_cycle}): ${plan.price_display}`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao criar planos:", error);
    throw error;
  }
};

// Executar seed se o arquivo for chamado diretamente
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log("🎉 Seed dos planos concluído!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erro no seed:", error);
      process.exit(1);
    });
}

module.exports = { seedPlans };
