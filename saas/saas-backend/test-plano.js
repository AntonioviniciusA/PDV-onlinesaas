const axios = require("axios");

const BASE_URL = "http://localhost:3000/saas";

async function testPlanoAPI() {
  try {
    console.log("🧪 Testando API de Planos (/plano)...\n");

    // Teste 1: Todos os planos
    console.log("1. GET /plano (todos os planos)");
    const response1 = await axios.get(`${BASE_URL}/plano`);
    console.log("✅ Status:", response1.status);
    console.log(
      "✅ Dados:",
      response1.data.data?.length || 0,
      "planos encontrados"
    );

    // Teste 2: Planos mensais
    console.log("\n2. GET /plano?billing_cycle=monthly");
    const response2 = await axios.get(
      `${BASE_URL}/plano?billing_cycle=monthly`
    );
    console.log("✅ Status:", response2.status);
    console.log(
      "✅ Dados:",
      response2.data.data?.length || 0,
      "planos mensais encontrados"
    );

    // Teste 3: Planos anuais
    console.log("\n3. GET /plano?billing_cycle=yearly");
    const response3 = await axios.get(`${BASE_URL}/plano?billing_cycle=yearly`);
    console.log("✅ Status:", response3.status);
    console.log(
      "✅ Dados:",
      response3.data.data?.length || 0,
      "planos anuais encontrados"
    );

    console.log("\n🎉 API /plano funcionando corretamente!");
    console.log("\n📋 URLs testadas:");
    console.log("   - GET /saas/plano");
    console.log("   - GET /saas/plano?billing_cycle=monthly");
    console.log("   - GET /saas/plano?billing_cycle=yearly");
  } catch (error) {
    console.error("❌ Erro:", error.response?.data || error.message);
    console.error("❌ Status:", error.response?.status);
  }
}

testPlanoAPI();
