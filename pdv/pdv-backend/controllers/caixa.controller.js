const { pool } = require("../config/database.js");

const LIMITE_CAIXAS_ABERTOS = 3; // Altere aqui se quiser outro limite

const abrirCaixa = async (req, res) => {
  let connection;
  try {
    const { valorInicial, usuario, id_loja, caixa_numero } = req.body;
    if (typeof valorInicial !== "number" || valorInicial < 25) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Valor mínimo para abertura: R$ 25,00",
      });
    }
    if (!id_loja || !usuario || !valorInicial || !caixa_numero) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Todos os campos são obrigatórios",
      });
    }
    connection = await pool.getConnection();
    // Verificar quantos caixas estão abertos
    const [rows] = await connection.query(
      "SELECT COUNT(*) as abertos FROM caixas WHERE status = 'aberto' AND id_loja = ?",
      [id_loja]
    );
    if (rows[0].abertos >= LIMITE_CAIXAS_ABERTOS) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Limite de ${LIMITE_CAIXAS_ABERTOS} caixas abertos atingido.`,
      });
    }
    if (caixa_numero && usuario) {
      const [caixas] = await connection.query(
        "SELECT id FROM caixas WHERE caixa_numero = ? AND id_loja = ? AND usuario = ? AND status = 'aberto'",
        [caixa_numero, id_loja, usuario]
      );
      if (caixas.length > 0) {
        return res.status(200).json({
          sucesso: true,
          mensagem: "Caixa já esta aberto",
          id_caixa: caixas[0].id,
          caixa_numero: caixa_numero,
          usuario: usuario,
          valor_inicial: valorInicial,
          status: "aberto",
          diferenca: 0,
          valor_final: 0,
          criado_em: new Date(),
        });
      }
    }

    if (caixa_numero && usuario) {
      const [caixaAberto] = await connection.query(
        "SELECT id, usuario FROM caixas WHERE caixa_numero = ? AND id_loja = ? AND status = 'aberto'",
        [caixa_numero, id_loja]
      );
      if (caixaAberto.length > 0) {
        if (caixaAberto[0].usuario !== usuario) {
          return res.status(400).json({
            sucesso: false,
            mensagem: "Caixa já esta aberto por outro usuario",
          });
        }
      }
    }

    // Abrir novo caixa (inserir)
    await connection.query(
      "INSERT INTO caixas (id_loja, status, valor_inicial, usuario, caixa_numero) VALUES (?, 'aberto', ?, ?, ?)",
      [id_loja, valorInicial, usuario, caixa_numero]
    );
    return res.status(200).json({
      sucesso: true,
      mensagem: "Caixa aberto com sucesso.",
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao abrir caixa",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const fecharCaixa = async (req, res) => {
  let connection;
  try {
    const { id_caixa, id_loja, valorFinal, usuario } = req.body;
    if (!id_caixa || !id_loja) {
      return res
        .status(400)
        .json({ mensagem: "ID do caixa e da loja são obrigatórios" });
    }
    connection = await pool.getConnection();
    // Atualizar status para fechado
    const [result] = await connection.query(
      "UPDATE caixas SET  status = 'fechado', valor_final = ?, usuario = ?, diferenca = valor_final - valor_inicial WHERE id = ? AND id_loja = ? AND status = 'aberto'",
      [valorFinal, usuario, id_caixa, id_loja]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Caixa não encontrado ou já está fechado.",
      });
    }
    return res.status(200).json({
      sucesso: true,
      mensagem: "Caixa fechado com sucesso.",
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao fechar caixa",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  abrirCaixa,
  fecharCaixa,
};
