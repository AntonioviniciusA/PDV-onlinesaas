const { pool } = require("./database");

const plansData = [
  // Planos Mensais
  {
    nome: "Básico",
    ciclo_cobranca: "monthly",
    preco: 90.0,
    preco_exibicao: "R$ 90",
    descricao: "Perfeito para pequenas empresas e startups.",
    max_usuarios: 5,
    limite_armazenamento_gb: 5,
    nivel_analytics: "basic",
    nivel_suporte: "email",
    acesso_api: false,
    nivel_acesso_api: "none",
    integracoes_personalizadas: false,
    funcionalidades: [
      "Até 5 usuários",
      "Analytics básico",
      "5GB de armazenamento",
      "Suporte por email",
    ],
    popular: false,
    texto_cta: "Teste Grátis",
    ordem_exibicao: 1,
    ativo: true,
  },
  {
    nome: "Profissional",
    ciclo_cobranca: "monthly",
    preco: 120.0,
    preco_exibicao: "R$ 120",
    descricao: "Ideal para empresas em crescimento.",
    max_usuarios: 20,
    limite_armazenamento_gb: 25,
    nivel_analytics: "advanced",
    nivel_suporte: "priority_email",
    acesso_api: true,
    nivel_acesso_api: "basic",
    integracoes_personalizadas: false,
    funcionalidades: [
      "Até 20 usuários",
      "Analytics avançado",
      "25GB de armazenamento",
      "Suporte prioritário por email",
      "Acesso à API",
    ],
    popular: true,
    texto_cta: "Teste Grátis",
    ordem_exibicao: 2,
    ativo: true,
  },
  {
    nome: "Empresarial",
    ciclo_cobranca: "monthly",
    preco: 199.0,
    preco_exibicao: "R$ 199",
    descricao: "Para grandes organizações com necessidades complexas.",
    max_usuarios: -1, // Ilimitado
    limite_armazenamento_gb: -1, // Ilimitado
    nivel_analytics: "custom",
    nivel_suporte: "phone_24_7",
    acesso_api: true,
    nivel_acesso_api: "advanced",
    integracoes_personalizadas: true,
    funcionalidades: [
      "Usuários ilimitados",
      "Analytics personalizado",
      "Armazenamento ilimitado",
      "Suporte 24/7 por telefone e email",
      "Acesso avançado à API",
      "Integrações personalizadas",
    ],
    popular: false,
    texto_cta: "Falar com Vendas",
    ordem_exibicao: 3,
    ativo: true,
  },

  // Planos Anuais
  {
    nome: "Básico",
    ciclo_cobranca: "yearly",
    preco: 972.0,
    preco_exibicao: "R$ 972",
    descricao: "Perfeito para pequenas empresas e startups.",
    max_usuarios: 5,
    limite_armazenamento_gb: 5,
    nivel_analytics: "basic",
    nivel_suporte: "email",
    acesso_api: false,
    nivel_acesso_api: "none",
    integracoes_personalizadas: false,
    funcionalidades: [
      "Até 5 usuários",
      "Analytics básico",
      "5GB de armazenamento",
      "Suporte por email",
    ],
    popular: false,
    texto_cta: "Teste Grátis",
    ordem_exibicao: 4,
    ativo: true,
  },
  {
    nome: "Profissional",
    ciclo_cobranca: "yearly",
    preco: 1296.0,
    preco_exibicao: "R$ 1296",
    descricao: "Ideal para empresas em crescimento.",
    max_usuarios: 20,
    limite_armazenamento_gb: 25,
    nivel_analytics: "advanced",
    nivel_suporte: "priority_email",
    acesso_api: true,
    nivel_acesso_api: "basic",
    integracoes_personalizadas: false,
    funcionalidades: [
      "Até 20 usuários",
      "Analytics avançado",
      "25GB de armazenamento",
      "Suporte prioritário por email",
      "Acesso à API",
    ],
    popular: true,
    texto_cta: "Teste Grátis",
    ordem_exibicao: 5,
    ativo: true,
  },
  {
    nome: "Empresarial",
    ciclo_cobranca: "yearly",
    preco: 1910.0,
    preco_exibicao: "R$ 1910",
    descricao: "Para grandes organizações com necessidades complexas.",
    max_usuarios: -1, // Ilimitado
    limite_armazenamento_gb: -1, // Ilimitado
    nivel_analytics: "custom",
    nivel_suporte: "phone_24_7",
    acesso_api: true,
    nivel_acesso_api: "advanced",
    integracoes_personalizadas: true,
    funcionalidades: [
      "Usuários ilimitados",
      "Analytics personalizado",
      "Armazenamento ilimitado",
      "Suporte 24/7 por telefone e email",
      "Acesso avançado à API",
      "Integrações personalizadas",
    ],
    popular: false,
    texto_cta: "Falar com Vendas",
    ordem_exibicao: 6,
    ativo: true,
  },
];

const seedPlans = async () => {
  let connection;
  try {
    console.log("🌱 Iniciando seed dos planos...");
    connection = await pool.getConnection();

    // Verificar se já existem planos
    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM plano"
    );
    const existingPlans = rows[0].count;

    if (existingPlans > 0) {
      console.log("✅ Planos já existem no banco de dados.");
      return;
    }

    // Criar todos os planos
    const insertQuery = `INSERT INTO plano 
      (nome, ciclo_cobranca, preco, preco_exibicao, descricao, max_usuarios, limite_armazenamento_gb, nivel_analytics, nivel_suporte, acesso_api, nivel_acesso_api, integracoes_personalizadas, funcionalidades, popular, texto_cta, ordem_exibicao, ativo)
      VALUES ?`;
    const values = plansData.map((plan) => [
      plan.nome,
      plan.ciclo_cobranca,
      plan.preco,
      plan.preco_exibicao,
      plan.descricao,
      plan.max_usuarios,
      plan.limite_armazenamento_gb,
      plan.nivel_analytics,
      plan.nivel_suporte,
      plan.acesso_api,
      plan.nivel_acesso_api,
      plan.integracoes_personalizadas,
      JSON.stringify(plan.funcionalidades),
      plan.popular,
      plan.texto_cta,
      plan.ordem_exibicao,
      plan.ativo,
    ]);
    await connection.query(insertQuery, [values]);

    console.log(`✅ ${plansData.length} planos criados com sucesso!`);
    console.log("📊 Planos disponíveis:");

    const [createdPlans] = await connection.query(
      `SELECT nome, ciclo_cobranca, preco_exibicao FROM plano ORDER BY ciclo_cobranca ASC, ordem_exibicao ASC`
    );

    createdPlans.forEach((plan) => {
      console.log(
        `   - ${plan.nome} (${plan.ciclo_cobranca}): ${plan.preco_exibicao}`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao criar planos:", error);
    throw error;
  } finally {
    if (connection) await connection.release();
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
