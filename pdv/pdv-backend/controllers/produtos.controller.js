const { pool } = require("../config/database.js");

const criarProduto = async (req, res) => {
  let connection;
  console.log("Criando produto com dados:", req.body);
  try {
    connection = await pool.getConnection();
    const {
      id_loja,
      codigo,
      codigo_barras,
      descricao,
      descricao_fiscal,
      grupo,
      ncm,
      origem,
      cfop_entrada,
      cfop_saida,
      cst_entrada,
      cst_saida,
      modalidade_bc_icms,
      aliquota_icms,
      aliquota_ipi,
      aliquota_pis,
      aliquota_cofins,
      credito_presumido,
      categoria_tributaria,
      cbs,
      ibs,
      ii,
      afrmm_fmm,
      preco_custo,
      margem_lucro,
      preco_venda,
      estoque_minimo,
      estoque_maximo,
      estoque_atual,
      unidade,
      controla_estoque,
      cfop,
      csosn,
      cst,
      icms,
      ativo,
      exibir_tela,
      solicita_quantidade,
      cest,
      cst_pis,
      pis,
      cst_cofins,
      cofins,
    } = req.body;

    const [result] = await connection.query(
      `
  INSERT INTO produto SET
    id_loja = ?,
    codigo = ?,
    codigo_barras = ?,
    descricao = ?,
    descricao_fiscal = ?,
    grupo = ?,
    ncm = ?,
    origem = ?,
    cfop_entrada = ?,
    cfop_saida = ?,
    cst_entrada = ?,
    cst_saida = ?,
    modalidade_bc_icms = ?,
    aliquota_icms = ?,
    aliquota_ipi = ?,
    aliquota_pis = ?,
    aliquota_cofins = ?,
    credito_presumido = ?,
    categoria_tributaria = ?,
    cbs = ?,
    ibs = ?,
    ii = ?,
    afrmm_fmm = ?,
    preco_custo = ?,
    margem_lucro = ?,
    preco_venda = ?,
    estoque_minimo = ?,
    estoque_maximo = ?,
    estoque_atual = ?,
    unidade = ?,
    controla_estoque = ?,
    cfop = ?,
    csosn = ?,
    cst = ?,
    icms = ?,
    ativo = ?,
    exibir_tela = ?,
    solicita_quantidade = ?,
    cest = ?,
    cst_pis = ?,
    pis = ?,
    cst_cofins = ?,
    cofins = ?
  `,
      [
        id_loja || "00000000-0000-0000-0000-000000000000",
        codigo,
        codigo_barras,
        descricao || null,
        descricao_fiscal || null,
        grupo || null,
        ncm || null,
        origem || null,
        cfop_entrada || null,
        cfop_saida || null,
        cst_entrada || null,
        cst_saida || null,
        modalidade_bc_icms || null,
        aliquota_icms || 0,
        aliquota_ipi || 0,
        aliquota_pis || 0,
        aliquota_cofins || 0,
        credito_presumido || null,
        categoria_tributaria || null,
        cbs || 0,
        ibs || 0,
        ii || 0,
        afrmm_fmm || null,
        preco_custo || 0,
        margem_lucro || 0,
        preco_venda || 0,
        estoque_minimo || 0,
        estoque_maximo || 0,
        estoque_atual || 0,
        unidade || "UN",
        !!controla_estoque,
        cfop || null,
        csosn || null,
        cst || null,
        icms || 0,
        ativo !== false,
        exibir_tela !== false,
        !!solicita_quantidade,
        cest || null,
        cst_pis || null,
        pis || 0,
        cst_cofins || null,
        cofins || 0,
      ]
    );

    return res.status(201).json({ sucesso: true, codigo });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar produto",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const listarProdutos = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [produtos] = await connection.query(
      "SELECT * FROM produto WHERE id_loja = ?",
      [req.query.id_loja]
    );

    // Log para debug - verificar tipos dos dados
    if (produtos.length > 0) {
      console.log(
        "Primeiro produto - preco_venda:",
        produtos[0].preco_venda,
        "tipo:",
        typeof produtos[0].preco_venda
      );
      console.log(
        "Primeiro produto - estoque_atual:",
        produtos[0].estoque_atual,
        "tipo:",
        typeof produtos[0].estoque_atual
      );
    }

    return res.status(200).json({ sucesso: true, produtos });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar produtos",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const listarProdutoPorId = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [produtos] = await connection.query(
      "SELECT * FROM produto WHERE id = ? AND id_loja = ?",
      [req.params.id, req.query.id_loja]
    );
    if (produtos.length === 0) {
      return res
        .status(404)
        .json({ sucesso: false, mensagem: "Produto não encontrado" });
    }
    return res.status(200).json({ sucesso: true, produto: produtos[0] });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar produto",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const atualizarProduto = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const {
      codigo,
      codigo_barras,
      descricao,
      descricao_fiscal,
      grupo,
      ncm,
      origem,
      cfop_entrada,
      cfop_saida,
      cst_entrada,
      cst_saida,
      modalidade_bc_icms,
      aliquota_icms,
      aliquota_ipi,
      aliquota_pis,
      aliquota_cofins,
      credito_presumido,
      categoria_tributaria,
      cbs,
      ibs,
      ii,
      afrmm_fmm,
      preco_custo,
      margem_lucro,
      preco_venda,
      estoque_minimo,
      estoque_maximo,
      estoque_atual,
      unidade,
      controla_estoque,
      cfop,
      csosn,
      cst,
      icms,
      ativo,
      exibir_tela,
      solicita_quantidade,
      cest,
      cst_pis,
      pis,
      cst_cofins,
      cofins,
    } = req.body;

    const [result] = await connection.query(
      `UPDATE produto SET
        codigo = ?, codigo_barras = ?, descricao = ?, descricao_fiscal = ?, grupo = ?, ncm = ?, origem = ?, cfop_entrada = ?, cfop_saida = ?,
        cst_entrada = ?, cst_saida = ?, modalidade_bc_icms = ?, aliquota_icms = ?, aliquota_ipi = ?, aliquota_pis = ?, aliquota_cofins = ?,
        credito_presumido = ?, categoria_tributaria = ?, cbs = ?, ibs = ?, ii = ?, afrmm_fmm = ?, preco_custo = ?, margem_lucro = ?, preco_venda = ?,
        estoque_minimo = ?, estoque_maximo = ?, estoque_atual = ?, unidade = ?, controla_estoque = ?, cfop = ?, csosn = ?, cst = ?, icms = ?,
        ativo = ?, exibir_tela = ?, solicita_quantidade = ?, cest = ?, cst_pis = ?, pis = ?, cst_cofins = ?, cofins = ?
      WHERE id = ? AND id_loja = ?`,
      [
        codigo,
        codigo_barras,
        descricao || "",
        descricao_fiscal || "",
        grupo || "",
        ncm || "",
        origem || "",
        cfop_entrada || "",
        cfop_saida || "",
        cst_entrada || "",
        cst_saida || "",
        modalidade_bc_icms || "",
        aliquota_icms || 0,
        aliquota_ipi || 0,
        aliquota_pis || 0,
        aliquota_cofins || 0,
        credito_presumido || "",
        categoria_tributaria || "",
        cbs || 0,
        ibs || 0,
        ii || 0,
        afrmm_fmm || "",
        preco_custo || 0,
        margem_lucro || 0,
        preco_venda || 0,
        estoque_minimo || 0,
        estoque_maximo || 0,
        estoque_atual || 0,
        unidade || "UN",
        controla_estoque || 0,
        cfop || "",
        csosn || "",
        cst || "",
        icms || 0,
        ativo || 1,
        exibir_tela || 1,
        solicita_quantidade || 0,
        cest || "",
        cst_pis || "",
        pis || 0,
        cst_cofins || "",
        cofins || 0,
        req.params.id,
        req.body.id_loja,
      ]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ sucesso: false, mensagem: "Produto não encontrado" });
    }
    return res
      .status(200)
      .json({ sucesso: true, mensagem: "Produto atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar produto",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const apagarProduto = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "DELETE FROM produto WHERE id = ? AND id_loja = ?",
      [req.params.id, req.query.id_loja]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ sucesso: false, mensagem: "Produto não encontrado" });
    }
    return res
      .status(200)
      .json({ sucesso: true, mensagem: "Produto apagado com sucesso" });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao apagar produto",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

// Atualiza o estoque dos produtos após uma venda
// Espera um array de objetos: [{id, quantidadeVendida}]
const atualizarEstoqueVenda = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { produtos, id_loja } = req.body; // produtos: [{id, quantidadeVendida}]
    if (!Array.isArray(produtos) || !id_loja) {
      return res
        .status(400)
        .json({ sucesso: false, mensagem: "Dados inválidos" });
    }

    for (const item of produtos) {
      await connection.query(
        "UPDATE produto SET estoque_atual = estoque_atual - ? WHERE id = ? AND id_loja = ? AND controla_estoque = 1",
        [item.quantidadeVendida, item.id, id_loja]
      );
    }
    return res
      .status(200)
      .json({ sucesso: true, mensagem: "Estoque atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar estoque",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  criarProduto,
  listarProdutos,
  listarProdutoPorId,
  atualizarProduto,
  apagarProduto,
  atualizarEstoqueVenda,
};
