const { Client } = require("pg");
require("dotenv").config();

/**
 * Cria o banco de dados definido em DB_NAME se não existir
 */
const createDatabaseIfNotExists = async () => {
  try {
    // Conectar ao PostgreSQL sem especificar banco
    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME, // Conectar ao banco padrão
    });

    await client.connect();

    // Verificar se o banco existe
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (result.rows.length === 0) {
      console.log(`📊 Criando banco de dados '${process.env.DB_NAME}'...`);
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(
        `✅ Banco de dados '${process.env.DB_NAME}' criado com sucesso!`
      );
    } else {
      console.log(`✅ Banco de dados '${process.env.DB_NAME}' já existe.`);
    }

    await client.end();
  } catch (error) {
    console.error("❌ Erro ao criar banco de dados:", error.message);
    throw error;
  }
};

module.exports = { createDatabaseIfNotExists };
