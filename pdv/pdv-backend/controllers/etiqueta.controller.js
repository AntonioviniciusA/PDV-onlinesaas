const { pool } = require("../config/database");
const printer = require("printer-lp");
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
      (nome, largura, altura, mostrar_comparacao, mostrar_icms, mostrar_codigo_de_barra, fonte_nome, fonte_preco, fonte_comparacao, fonte_codigo_de_barra, cor_fundo, cor_texto, cor_preco, cor_comparacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cfg.nome,
        cfg.largura,
        cfg.altura,
        !!cfg.mostrar_comparacao,
        !!cfg.mostrar_icms,
        !!cfg.mostrar_codigo_de_barra,
        cfg.fonte_nome,
        cfg.fonte_preco,
        cfg.fonte_comparacao,
        cfg.fonte_codigo_de_barra,
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
        nome=?, largura=?, altura=?, mostrar_comparacao=?, mostrar_icms=?, mostrar_codigo_de_barra=?,
        fonte_nome=?, fonte_preco=?, fonte_comparacao=?, fonte_codigo_de_barra=?,
        cor_fundo=?, cor_texto=?, cor_preco=?, cor_comparacao=?
      WHERE id=?`,
      [
        cfg.nome,
        cfg.largura,
        cfg.altura,
        !!cfg.mostrar_comparacao,
        !!cfg.mostrar_icms,
        !!cfg.mostrar_codigo_de_barra,
        cfg.fonte_nome,
        cfg.fonte_preco,
        cfg.fonte_comparacao,
        cfg.fonte_codigo_de_barra,
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
// Listar todos os templates padrão de etiqueta
const listDefaultEtiquetaTemplates = async (req, res) => {
  let connection;
  try {
    console.log("listEtiquetaTemplates");
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT * FROM etiqueta_configuracoes WHERE id_loja = '00000000-0000-0000-0000-000000000000'"
    );

    console.log("rows", rows);
    if (rows.length === 0) {
      return res.json({
        success: true,
        templates: [],
        message: "Nenhum template encontrado.",
      });
    }
    return res.json({
      success: true,
      templates: rows,
      message: "Templates de etiqueta listados com sucesso.",
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Listar todos os templates de etiqueta
const listEtiquetaTemplates = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM etiqueta_configuracoes WHERE id_loja = ?",
      [req.user.id_loja]
    );
    return res.json({
      success: true,
      templates: rows,
      message: "Templates de etiqueta listados com sucesso.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const imprimirEtiqueta = async (req, res) => {
  try {
    const { idConfigEtiqueta, id_produto } = req.body;
    const { id_loja } = req.user;

    const [rows] = await pool.query(
      "SELECT * FROM etiqueta_configuracoes WHERE id = ?",
      [idConfigEtiqueta]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Etiqueta não encontrada." });
    }

    const etiqueta = rows[0];

    const [produto] = await pool.query(
      "SELECT * FROM produtos WHERE id = ? AND id_loja = ?",
      [id_produto, id_loja]
    );
    if (produto.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado." });
    }

    const { nome: nome_produto, codigo, preco, icms } = produto[0];

    const zpl = `
^XA
^CF0,30
^FO50,30^FD${nome_produto}^FS
^CF0,25
^FO50,70^FDPreço: R$ ${preco.toFixed(2)}^FS
${etiqueta.mostrar_icms ? `^FO50,110^FDICMS: ${icms}%^FS` : ""}
${
  etiqueta.mostrar_codigo_de_barra
    ? `^FO50,150^BCN,100,Y,N,N^FD${codigo}^FS`
    : ""
}
^XZ
    `.trim();

    const nomeImpressora =
      process.platform === "win32"
        ? "ZDesigner GC420t" // nome exato da impressora no Windows
        : "Zebra_GC420t"; // nome exato no Linux (verifique com `lpstat -p`)

    printer.printText(zpl, { printer: nomeImpressora }, (err, jobID) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, jobID });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEtiquetaConfig,
  saveEtiquetaConfig,
  updateEtiquetaConfig,
  listDefaultEtiquetaTemplates,
  listEtiquetaTemplates,
  imprimirEtiqueta,
};
