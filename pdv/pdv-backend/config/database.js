const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 */
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log("✅ Successfully connected to MySQL database");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to MySQL:", error.message);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

/**
 * Create a direct connection (not from pool)
 */
async function connectDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Direct connection to MySQL established");
  } catch (error) {
    console.error(
      "❌ Failed to create direct MySQL connection:",
      error.message
    );
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

/**
 * Execute SQL from file with improved error handling and transaction support
 */
async function executeSqlFile(filePath) {
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = await fs.readFile(filePath, "utf8");

    // Start transaction
    await connection.beginTransaction();

    // Split into individual queries and execute in order
    const queries = sql
      .split(";")
      .filter((q) => q.trim().length > 0)
      .map((q) => q.trim());

    for (const query of queries) {
      try {
        await connection.query(query);
      } catch (queryError) {
        console.error(`❌ Error executing query: ${query.substring(0, 50)}...`);
        await connection.rollback();
        throw queryError;
      }
    }

    // Commit transaction
    await connection.commit();
    console.log(
      `✅ Successfully executed SQL file: ${path.basename(filePath)}`
    );
    return true;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }
    console.error(
      `❌ Error executing SQL file ${path.basename(filePath)}:`,
      error.message
    );
    return false;
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

/**
 * Generate database schema with transaction support
 */
async function generateDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Execute database.sql which contains all table creation and foreign key constraints
    await executeSqlFile(path.join(__dirname, "../database/pdvlocal.sql"));

    await connection.commit();
    console.log("✅ Database schema created successfully!");
    return true;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Error creating database schema:", error.message);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

/**
 * Create admin users with transaction support
 */
async function createAdminUsers() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await executeSqlFile(path.join(__dirname, "seed_admin.sql"));

    await connection.commit();
    console.log("✅ Admin users created successfully!");
    return true;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Error creating admin users:", error.message);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

/**
 * Validate database schema
 */
async function validateDatabaseSchema() {
  let connection;
  try {
    connection = await pool.getConnection();
    const tables = [
      "users",
      "addresses",
      "admins",
      "departments",
      "categories",
      "products",
      "product_images",
      "orders",
      "order_items",
      "coupons",
      "product_reviews",
      "website_reviews",
      "promotions",
      "security_settings",
      "site_settings",
      "order_coupons",
    ];

    for (const table of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length === 0) {
        throw new Error(`Table ${table} not found`);
      }

      // Validate table structure
      const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
      if (columns.length === 0) {
        throw new Error(`Table ${table} has no columns`);
      }
    }

    console.log("✅ Database schema validation successful");
    return true;
  } catch (error) {
    console.error("❌ Database schema validation failed:", error.message);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

/**
 * Migrate database with transaction support
 */
async function migrateDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Execute in correct order to respect foreign key constraints
    await generateDatabase();
    await validateDatabaseSchema();
    await createAdminUsers();

    await connection.commit();
    console.log("✅ Database migration completed successfully");
    return true;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Database migration failed:", error.message);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

// Funções de sincronização (placeholders)
async function sincronizarProdutos() {
  console.log("Sincronizando produtos...");
  // TODO: implementar lógica de sincronização
  return Promise.resolve();
}

async function sincronizarCupons() {
  console.log("Sincronizando cupons...");
  // TODO: implementar lógica de sincronização
  return Promise.resolve();
}

async function sincronizarRecibos() {
  console.log("Sincronizando recibos...");
  // TODO: implementar lógica de sincronização
  return Promise.resolve();
}

async function sincronizarVendas() {
  console.log("Sincronizando vendas...");
  // TODO: implementar lógica de sincronização
  return Promise.resolve();
}

// Export functions
module.exports = {
  pool,
  testConnection,
  connectDatabase,
  executeSqlFile,
  generateDatabase,
  createAdminUsers,
  validateDatabaseSchema,
  migrateDatabase,
  sincronizarProdutos,
  sincronizarCupons,
  sincronizarRecibos,
  sincronizarVendas,
};
