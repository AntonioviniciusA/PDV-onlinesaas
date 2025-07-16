const { pool } = require("../config/database");

// Carregar configuração de etiqueta (pega a mais recente)
const getEtiquetaConfig = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM etiqueta_configuracoes ORDER BY atualizado_em DESC LIMIT 1"
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Nenhuma configuração encontrada." });
    }
    return res.json({ success: true, config: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Salvar nova configuração de etiqueta
const saveEtiquetaConfig = async (req, res) => {
  try {
    const cfg = req.body;
    const [result] = await pool.query(
      `INSERT INTO etiqueta_configuracoes
      (nome, largura, altura, show_comparison, show_icms, show_barcode, font_name, font_price, font_comparison, font_barcode, cor_fundo, cor_texto, cor_preco, cor_comparacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cfg.nome,
        cfg.largura,
        cfg.altura,
        !!cfg.show_comparison,
        !!cfg.show_icms,
        !!cfg.show_barcode,
        cfg.font_name,
        cfg.font_price,
        cfg.font_comparison,
        cfg.font_barcode,
        cfg.cor_fundo,
        cfg.cor_texto,
        cfg.cor_preco,
        cfg.cor_comparacao,
      ]
    );
    return res.json({ success: true, id: result.insertId });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Atualizar configuração existente
const updateEtiquetaConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const cfg = req.body;
    const [result] = await pool.query(
      `UPDATE etiqueta_configuracoes SET
        nome=?, largura=?, altura=?, show_comparison=?, show_icms=?, show_barcode=?,
        font_name=?, font_price=?, font_comparison=?, font_barcode=?,
        cor_fundo=?, cor_texto=?, cor_preco=?, cor_comparacao=?
      WHERE id=?`,
      [
        cfg.nome,
        cfg.largura,
        cfg.altura,
        !!cfg.show_comparison,
        !!cfg.show_icms,
        !!cfg.show_barcode,
        cfg.font_name,
        cfg.font_price,
        cfg.font_comparison,
        cfg.font_barcode,
        cfg.cor_fundo,
        cfg.cor_texto,
        cfg.cor_preco,
        cfg.cor_comparacao,
        id,
      ]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Configuração não encontrada." });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// Listar todos os templates de etiqueta
const listEtiquetaTemplates = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM etiqueta_configuracoes ORDER BY nome ASC"
    );
    return res.json({ success: true, templates: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getEtiquetaConfig,
  saveEtiquetaConfig,
  updateEtiquetaConfig,
  listEtiquetaTemplates,
};
