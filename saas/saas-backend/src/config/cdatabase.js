const mysql = require("mysql2/promise");
require("dotenv").config();
/**
 * Cria o banco de dados do cliente e executa o script de estrutura (cdatabase.sql)
 * @param {string} clienteId - ID do cliente (usado como nome do banco)
 */
async function createClienteDatabase(clienteId) {
  const databaseName = `cliente_${clienteId.replace(/-/g, "")}`;
  let connection;
  try {
    // Conecta ao MySQL sem selecionar banco específico
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      multipleStatements: true,
    });

    // Cria o banco de dados se não existir
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    // Lê o arquivo SQL de estrutura
    const fs = require("fs").promises;
    const path = require("path");
    const sqlPath = path.join(__dirname, "../database/cdatabase.sql");
    let sql = await fs.readFile(sqlPath, "utf8");

    // Remove comentários e linhas em branco (opcional, mas pode evitar problemas)
    sql = sql
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("--") &&
          !line.trim().startsWith("#") &&
          line.trim() !== ""
      )
      .join("\n");

    // Executa o script SQL no banco recém-criado
    await connection.changeUser({ database: databaseName });
    await connection.query(sql);

    // Sucesso
    console.log(
      `✅ Banco de dados do cliente '${databaseName}' criado com sucesso.`
    );
    return true;
  } catch (err) {
    console.error("Erro ao criar banco de dados do cliente:", err);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Cria um pool de conexão para o banco de dados do cliente
 * @param {string} databaseName - Nome do banco de dados do cliente
 * @returns {Pool} pool de conexões
 */
function createClientePool(databaseName) {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: databaseName,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

/**
 * Função para contar registros de uma tabela específica do cliente
 * @param {Pool} pool - pool de conexões do cliente
 * @param {string} tabela - nome da tabela
 * @returns {Promise<number>} quantidade de registros
 */
async function contarRegistros(pool, tabela) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as total FROM \`${tabela}\``
  );
  return rows[0].total;
}

/**
 * Função para verificar se o cliente pode criar mais registros em uma tabela
 * @param {Pool} pool - pool de conexões do cliente
 * @param {string} tabela - nome da tabela
 * @param {number} limite - limite máximo permitido
 * @returns {Promise<boolean>} true se pode criar, false se atingiu o limite
 */
async function podeCriarMais(pool, tabela, limite) {
  const total = await contarRegistros(pool, tabela);
  return total < limite;
}

module.exports = {
  createClientePool,
  contarRegistros,
  podeCriarMais,
};
