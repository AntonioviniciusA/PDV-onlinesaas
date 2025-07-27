const { pool } = require("../config/database.js");

const criarProduto = async (req, res) => {
  let connection;
  console.log("Criando produto com dados:", req.body);
  try {
    connection = await pool.getConnection();
    const {
      codigo,
      codigo_barras,
      descricao,
      grupo,
      ncm,
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
      permitir_combinacao,
      cest,
      cst_pis,
      pis,
      cst_cofins,
      cofins,
    } = req.body;

    const [result] = await connection.query(
      `INSERT INTO produto (
        id_loja, codigo, codigo_barras, descricao, grupo, ncm, preco_custo, margem_lucro, preco_venda,
        estoque_minimo, estoque_maximo, estoque_atual, unidade, controla_estoque, cfop, csosn, cst, icms,
        ativo, exibir_tela, solicita_quantidade, permitir_combinacao, cest, cst_pis, pis, cst_cofins, cofins
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo,
        codigo_barras,
        descricao || "",
        grupo || "",
        ncm || "",
        preco_custo || 0,
        margem_lucro || 0,
        preco_venda || 0,
        estoque_minimo || 0,
        estoque_maximo || 0,
        estoque_atual || 0,
        unidade || "",
        controla_estoque || 0,
        cfop || "",
        csosn || "",
        cst || 0,
        icms || 0,
        ativo || 1,
        exibir_tela || 0,
        solicita_quantidade || 0,
        permitir_combinacao || 0,
        cest || "",
        cst_pis || 0,
        pis || 0,
        cst_cofins || 0,
        cofins || 0,
      ]
    );

    return res.status(201).json({ sucesso: true, id: result.insertId });
  } catch (error) {
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
      grupo,
      ncm,
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
      permitir_combinacao,
      cest,
      cst_pis,
      pis,
      cst_cofins,
      cofins,
    } = req.body;

    const [result] = await connection.query(
      `UPDATE produto SET
        codigo = ?, codigo_barras = ?, descricao = ?, grupo = ?, ncm = ?, preco_custo = ?, margem_lucro = ?, preco_venda = ?,
        estoque_minimo = ?, estoque_maximo = ?, estoque_atual = ?, unidade = ?, controla_estoque = ?, cfop = ?, csosn = ?, cst = ?, icms = ?,
        ativo = ?, exibir_tela = ?, solicita_quantidade = ?, permitir_combinacao = ?, cest = ?, cst_pis = ?, pis = ?, cst_cofins = ?, cofins = ?
      WHERE id = ? AND id_loja = ?`,
      [
        codigo,
        codigo_barras,
        descricao,
        grupo,
        ncm,
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
        permitir_combinacao,
        cest,
        cst_pis,
        pis,
        cst_cofins,
        cofins,
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
