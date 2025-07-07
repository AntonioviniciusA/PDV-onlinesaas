const { sequelize } = require("./database");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

const runMigrations = async () => {
  try {
    console.log("🔄 Iniciando migrações...");

    // Sincronizar modelos com o banco de dados
    await sequelize.sync({ force: false, alter: true });

    console.log("✅ Migrações concluídas com sucesso!");
    console.log("📊 Tabelas criadas/atualizadas:");
    console.log("   - users");
    console.log("   - subscriptions");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante as migrações:", error);
    process.exit(1);
  }
};

// Executar migrações se o arquivo for chamado diretamente
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
