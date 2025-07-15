const mysql = require("mysql2/promise");

const testDatabase = async () => {
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "pdv_saas",
    port: process.env.DB_PORT || 3306,
  };

  console.log("🔧 Configuração do banco:", dbConfig);

  try {
    console.log("🔌 Tentando conectar ao MySQL...");
    const connection = await mysql.createConnection(dbConfig);

    console.log("✅ Conexão com MySQL estabelecida!");

    // Testar se a tabela plano existe
    console.log("📋 Verificando tabela plano...");
    const [tables] = await connection.execute('SHOW TABLES LIKE "plano"');

    if (tables.length > 0) {
      console.log("✅ Tabela plano encontrada!");

      // Contar registros na tabela plano
      const [rows] = await connection.execute(
        "SELECT COUNT(*) as count FROM plano"
      );
      console.log(`📊 Total de planos na tabela: ${rows[0].count}`);

      // Mostrar alguns planos
      const [planos] = await connection.execute(
        "SELECT id, nome, ciclo_cobranca FROM plano LIMIT 3"
      );
      console.log("📋 Primeiros planos:", planos);
    } else {
      console.log("❌ Tabela plano não encontrada!");
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco:", error.message);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("💡 Dica: Verifique usuário e senha do MySQL");
    } else if (error.code === "ECONNREFUSED") {
      console.log("💡 Dica: MySQL não está rodando ou porta incorreta");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.log("💡 Dica: Banco de dados não existe");
    }
  }
};

testDatabase();
