const { pool } = require("../config/database");

/**
 * Buscar todos os planos ativos
 * @route GET /saas/plano
 * @access Public
 */
const getAllPlanos = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const query = `
      SELECT 
        id,
        nome,
        ciclo_cobranca,
        preco,
        preco_exibicao,
        descricao,
        max_usuarios,
        limite_armazenamento_gb,
        nivel_analytics,
        nivel_suporte,
        acesso_api,
        nivel_acesso_api,
        integracoes_personalizadas,
        funcionalidades,
        popular,
        texto_cta,
        ordem_exibicao,
        ativo
      FROM plano 
      WHERE ativo = true
      ORDER BY ciclo_cobranca ASC, ordem_exibicao ASC
    `;

    const [planos] = await connection.query(query);

    // Converter funcionalidades de JSON string para array
    const planosFormatados = planos.map((plano) => ({
      ...plano,
      funcionalidades: JSON.parse(plano.funcionalidades),
    }));

    res.json({
      success: true,
      message: "Planos recuperados com sucesso",
      data: planosFormatados,
      count: planosFormatados.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar planos:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao buscar planos",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
};

/**
 * Buscar todos os planos ativos
 * @route GET /saas/planos
 * @access Public
 */
const getPlanosByBilling_cycle = async (req, res) => {
  let connection;
  try {
    const { billing_cycle } = req.params;
    connection = await pool.getConnection();

    let query = `
      SELECT 
        id,
        nome,
        ciclo_cobranca,
        preco,
        preco_exibicao,
        descricao,
        max_usuarios,
        limite_armazenamento_gb,
        nivel_analytics,
        nivel_suporte,
        acesso_api,
        nivel_acesso_api,
        integracoes_personalizadas,
        funcionalidades,
        popular,
        texto_cta,
        ordem_exibicao,
        ativo
      FROM plano 
      WHERE ativo = true
    `;
    let params = [];

    // Filtrar por ciclo de cobrança se fornecido
    if (billing_cycle) {
      query += " AND ciclo_cobranca = ?";
      params.push(billing_cycle);
    }

    query += " ORDER BY ciclo_cobranca ASC, ordem_exibicao ASC";

    const [planos] = await connection.query(query, params);

    // Converter funcionalidades de JSON string para array
    const planosFormatados = planos.map((plano) => ({
      ...plano,
      funcionalidades: JSON.parse(plano.funcionalidades),
    }));

    res.json({
      success: true,
      message: "Planos recuperados com sucesso",
      data: planosFormatados,
      count: planosFormatados.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar planos:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao buscar planos",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
};

/**
 * Buscar plano por ID
 * @route GET /saas/plano/:id
 * @access Public.
 */
const getPlanosPorId = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID do plano é obrigatório",
      });
    }

    connection = await pool.getConnection();

    const query = `
      SELECT 
        id,
        nome,
        ciclo_cobranca,
        preco,
        preco_exibicao,
        descricao,
        max_usuarios,
        limite_armazenamento_gb,
        nivel_analytics,
        nivel_suporte,
        acesso_api,
        nivel_acesso_api,
        integracoes_personalizadas,
        funcionalidades,
        popular,
        texto_cta,
        ordem_exibicao,
        ativo
      FROM plano 
      WHERE id = ? AND ativo = true
    `;

    const [planos] = await connection.query(query, [id]);

    if (planos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plano não encontrado",
      });
    }

    const plano = planos[0];

    // Converter funcionalidades de JSON string para array
    const planoFormatado = {
      ...plano,
      funcionalidades: JSON.parse(plano.funcionalidades),
    };

    res.json({
      success: true,
      message: "Plano recuperado com sucesso",
      data: planoFormatado,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar plano por ID:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao buscar plano",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
};

module.exports = {
  getAllPlanos,
  getPlanosByBilling_cycle,
  getPlanosPorId,
};
