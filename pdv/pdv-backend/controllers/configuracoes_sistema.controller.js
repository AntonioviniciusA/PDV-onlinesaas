const { pool } = require("../config/database");

// Buscar configuração do sistema
const getConfiguracoesSistema = async (req, res) => {
  try {
    const id_loja = req.query.id_loja || "00000000-0000-0000-0000-000000000000";
    const [rows] = await pool.query(
      "SELECT id, id_loja, link_api_cupom, atualizado_em FROM configuracoes_sistema WHERE id_loja = ? ORDER BY atualizado_em DESC LIMIT 1",
      [id_loja]
    );
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Configuração não encontrada." });
    }
    return res.json({ success: true, configuracao: rows[0] });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar configuração.",
      error: err.message,
    });
  }
};

// Atualizar configuração do sistema
const atualizarConfiguracoesSistema = async (req, res) => {
  try {
    const { id_loja, link_api_cupom } = req.body;
    if (!id_loja || !link_api_cupom) {
      return res.status(400).json({
        success: false,
        message: "id_loja e link_api_cupom são obrigatórios.",
      });
    }

    // Verifica se já existe configuração para a loja
    const [rows] = await pool.query(
      "SELECT id FROM configuracoes_sistema WHERE id_loja = ?",
      [id_loja]
    );

    if (rows.length) {
      // Atualiza
      await pool.query(
        "UPDATE configuracoes_sistema SET link_api_cupom = ?, atualizado_em = NOW() WHERE id_loja = ?",
        [link_api_cupom, id_loja]
      );
    } else {
      // Insere
      await pool.query(
        "INSERT INTO configuracoes_sistema (id_loja, link_api_cupom) VALUES (?, ?)",
        [id_loja, link_api_cupom]
      );
    }

    return res.json({
      success: true,
      message: "Configuração salva com sucesso.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Erro ao salvar configuração.",
      error: err.message,
    });
  }
};

module.exports = {
  getConfiguracoesSistema,
  atualizarConfiguracoesSistema,
};
