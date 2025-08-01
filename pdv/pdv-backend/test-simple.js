const { pool } = require("./config/database");

async function testSimple() {
  let connection;
  try {
    console.log("=== TESTE SIMPLES ===");

    connection = await pool.getConnection();
    console.log("✅ Conexão OK");

    // Testar se a tabela users existe
    const [tables] = await connection.query('SHOW TABLES LIKE "users"');
    console.log("Tabela users existe:", tables.length > 0);

    if (tables.length > 0) {
      // Contar usuários
      const [count] = await connection.query(
        "SELECT COUNT(*) as total FROM users"
      );
      console.log("Total de usuários:", count[0].total);

      // Listar alguns usuários
      const [users] = await connection.query(
        "SELECT id, nome, email, perfil FROM users LIMIT 5"
      );
      console.log("Primeiros usuários:");
      users.forEach((user) => {
        console.log(`- ${user.nome} (${user.email}) - ${user.perfil}`);
      });
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    if (connection) {
      await connection.release();
    }
    process.exit(0);
  }
}

testSimple();
