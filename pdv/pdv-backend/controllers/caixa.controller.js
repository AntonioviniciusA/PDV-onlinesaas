const { pool } = require("../config/database.js");
const bcrypt = require("bcryptjs");
const LIMITE_CAIXAS_ABERTOS = 3; // Altere aqui se quiser outro limite

const abrirCaixa = async (req, res) => {
  console.log("Abrir caixa");
  let connection;
  try {
    const { amount, usuario, caixa_numero } = req.body;
    const valor = Number(amount);
    console.log("req.user:", req.user);

    if (isNaN(valor) || valor < 25) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Valor mínimo para abertura: R$ 25,00",
      });
    }
    if (
      !usuario.id_loja ||
      !usuario.id ||
      !valor ||
      !usuario.autorizador ||
      !caixa_numero
    ) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Todos os campos são obrigatórios",
      });
    }
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ sucesso: false, mensagem: "Usuário não autenticado" });
    }
    connection = await pool.getConnection();
    // Verificar quantos caixas estão abertos
    const [rows] = await connection.query(
      "SELECT COUNT(*) as abertos FROM caixas WHERE status = 'aberto' AND id_loja = ?",
      [usuario.id_loja]
    );
    if (rows[0].abertos >= LIMITE_CAIXAS_ABERTOS) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Limite de ${LIMITE_CAIXAS_ABERTOS} caixas abertos atingido.`,
      });
    }
    if (caixa_numero && usuario) {
      const [caixas] = await connection.query(
        "SELECT id FROM caixas WHERE caixa_numero = ? AND id_loja = ? AND user_id = ? AND status = 'aberto'",
        [caixa_numero, usuario.id_loja, req.user.id]
      );
      if (caixas.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Caixa já esta aberto",
          id_caixa: caixas[0].id,
          caixa_numero: caixa_numero,
          user_id: req.user.id,
          valor_inicial: valor,
          status: "aberto",
          diferenca: 0,
          valor_final: 0,
          criado_em: new Date(),
        });
      }
    }

    if (caixa_numero && usuario) {
      const [caixaAberto] = await connection.query(
        "SELECT id, user_id FROM caixas WHERE caixa_numero = ? AND id_loja = ? AND status = 'aberto'",
        [caixa_numero, usuario.id_loja]
      );
      if (caixaAberto.length > 0) {
        if (caixaAberto[0].user_id !== req.user.id) {
          return res.status(400).json({
            sucesso: false,
            mensagem: "Caixa já esta aberto por outro usuario",
          });
        }
      }
    }

    // Abrir novo caixa (inserir)
    const token = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    const [caixa] = await connection.query(
      "INSERT INTO caixas (id_loja, caixa_numero, status, valor_inicial, token, abertura_usuario_id, operador_usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        usuario.id_loja,
        caixa_numero,
        "aberto",
        valor,
        token,
        req.user.id,
        req.user.id,
      ]
    );
    console.log("caixa", caixa);
    return res.status(200).json({
      sucesso: true,
      mensagem: "Caixa aberto com sucesso.",
      caixa: {
        id: caixa[0].id,
        id_loja: caixa[0].id_loja,
        caixa_numero: caixa[0].caixa_numero,
        status: caixa[0].status,
        valor_inicial: caixa[0].valor_inicial,
        abertura_usuario_id: caixa[0].abertura_usuario_id,
        operador_usuario_id: caixa[0].operador_usuario_id,
        token: caixa[0].token,
        criado_em: caixa[0].criado_em,
        atualizado_em: caixa[0].atualizado_em,
      },
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
    const { id_caixa, id_loja, amount } = req.body;
    const valor = Number(amount);
    if (!id_caixa || !id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "ID do caixa e da loja são obrigatórios",
      });
    }
    if (isNaN(valor)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Valor informado inválido.",
      });
    }
    connection = await pool.getConnection();
    const [caixaAberto] = await connection.query(
      "SELECT * FROM caixas WHERE id = ?",
      [id_caixa]
    );
    if (!caixaAberto || caixaAberto.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Caixa não encontrado.",
      });
    }
    const diferenca = valor - caixaAberto[0].valor_inicial;
    // Atualizar status para fechado
    const [result] = await connection.query(
      "UPDATE caixas SET  status = 'fechado', valor_final = ?, fechamento_usuario_id = ?, diferenca = ? WHERE id = ? AND id_loja = ? AND status = 'aberto'",
      [valor, req.user.id, diferenca, id_caixa, id_loja]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Caixa não encontrado ou já está fechado.",
      });
    }
    const [caixaFechado] = await connection.query(
      "SELECT * FROM caixas WHERE id = ?",
      [id_caixa]
    );
    return res.status(200).json({
      sucesso: true,
      mensagem: "Caixa fechado com sucesso.",
      id_caixa: caixaFechado[0].id,
      id_loja: caixaFechado[0].id_loja,
      valor_inicial: caixaFechado[0].valor_inicial,
      fechamento_usuario_id: caixaFechado[0].fechamento_usuario_id,
      status: caixaFechado[0].status,
      diferenca: caixaFechado[0].diferenca,
      valor_final: caixaFechado[0].valor_final,
      criado_em: caixaFechado[0].criado_em,
      atualizado_em: caixaFechado[0].atualizado_em,
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

const autorizarCaixa = async (req, res) => {
  let connection;
  try {
    console.log("Autorizar caixa");
    const { entrada } = req.body;
    console.log("Entrada: ", entrada);
    const [id, senha] = entrada.trim().split(".");
    if (!id || !senha) {
      return res
        .status(400)
        .json({ sucesso: false, mensagem: "ID ou senha não informados" });
    }
    connection = await pool.getConnection();
    try {
      // Buscar usuário pelo id
      const [usuarios] = await connection.query(
        "SELECT id, nome, perfil, senha, permissions, id_loja FROM users WHERE id = ?",
        [id]
      );
      if (!usuarios.length) {
        return res
          .status(401)
          .json({ sucesso: false, mensagem: "Usuário não encontrado" });
      }
      const usuario = usuarios[0];
      const senhaValida = await bcrypt.compare(senha.trim(), usuario.senha);
      console.log("senhaValida", senhaValida);

      if (!senhaValida) {
        return res
          .status(401)
          .json({ sucesso: false, mensagem: "Senha incorreta." });
      }

      // Padronizar permissions para array
      let permissions = usuario.permissions;
      if (typeof permissions === "string") {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = [];
        }
      }
      if (!permissions.includes("pdv.authorize")) {
        console.log("Usuario: não tem permissão para autorizar");
        return res.status(403).json({
          sucesso: false,
          mensagem: "Usuário não tem permissão para autorizar",
        });
      }
      console.log("Usuario: tem permissão para autorizar");
      // Gerar código autorizador de 20 dígitos aleatórios
      const autorizador = Array.from({ length: 20 }, () =>
        Math.floor(Math.random() * 10)
      ).join("");
      console.log("Autorizador: ", autorizador);
      await connection.query(
        "INSERT INTO autorizadores (usuario_id, autorizador, id_loja) VALUES (?, ?, ?)",
        [usuario.id, autorizador, usuario.id_loja]
      );
      return res.status(200).json({
        sucesso: true,
        mensagem: "Autorizado",
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          perfil: usuario.perfil,
          id_loja: usuario.id_loja,
          autorizador: autorizador,
        },
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao autorizar",
        erro: error.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao autorizar",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const checkAutorizacao = async (req, res) => {
  let connection;
  const { usuario } = req.body;
  console.log("usuario", usuario);
  console.log("autorizador", usuario.autorizador);
  connection = await pool.getConnection();
  try {
    const [autorizadores] = await connection.query(
      "SELECT * FROM autorizadores WHERE autorizador = ?",
      [usuario.autorizador]
    );
    if (autorizadores.length > 0) {
      return res.status(200).json({ autorizado: true, usuario: usuario });
    } else {
      return res.status(200).json({ autorizado: false, usuario: usuario });
    }
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao verificar autorização",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const getCaixasAbertos = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [caixas] = await connection.query(
      "SELECT id, caixa_numero, status, valor_inicial, abertura_usuario_id, operador_usuario_id, criado_em, atualizado_em FROM caixas WHERE status = 'aberto' AND id_loja = ?",
      [req.user.id_loja]
    );
    return res.status(200).json({ caixas });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar caixas abertos",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const getCaixasFechados = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [caixas] = await connection.query(
      "SELECT id, caixa_numero, status, valor_inicial, abertura_usuario_id, operador_usuario_id, criado_em, atualizado_em FROM caixas WHERE status = 'fechado' AND id_loja = ?",
      [req.user.id_loja]
    );
    return res.status(200).json({ caixas });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar caixas fechados",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const verificaCaixaAberto = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const caixa = req.cookies.caixa;
    console.log("caixa", caixa);
    const [caixaAberto] = await connection.query(
      "SELECT * FROM caixas WHERE status = 'aberto' AND id_loja = ? AND token = ?",
      [req.user.id_loja, caixa.token]
    );
    if (caixaAberto.length > 0) {
      return res.status(200).json({ sucesso: true, caixa: caixaAberto[0] });
    } else {
      return res.status(200).json({ sucesso: false, caixa: [] });
    }
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao verificar se o caixa está aberto",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const getHistoricoCaixas = async (req, res) => {
  let connection;
  const { caixa } = req.body;
  const { n_venda, data, forma_pagamento } = req.query; // Use req.query em vez de req.params

  try {
    connection = await pool.getConnection();

    // Início da query base
    let queryVendas = "SELECT * FROM vendas WHERE caixa_id = ? AND id_loja = ?";
    let queryPagamentos =
      "SELECT * FROM pagamentos WHERE caixa_id = ? AND id_loja = ?";

    const valuesVendas = [caixa.id, caixa.id_loja];
    const valuesPagamentos = [caixa.id, caixa.id_loja];

    // Adiciona filtros dinamicamente
    if (n_venda) {
      queryVendas += " AND n_venda = ?";
      valuesVendas.push(n_venda);
    }

    if (data) {
      queryVendas += " AND DATE(data) = ?";
      valuesVendas.push(data);
    }

    if (forma_pagamento) {
      queryPagamentos += " AND forma_pagamento = ?";
      valuesPagamentos.push(forma_pagamento);
    }

    const [vendas] = await connection.query(queryVendas, valuesVendas);
    const [pagamentos] = await connection.query(
      queryPagamentos,
      valuesPagamentos
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Histórico de caixas encontrado",
      vendas,
      pagamentos,
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar histórico de caixas",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  abrirCaixa,
  fecharCaixa,
  autorizarCaixa,
  checkAutorizacao,
  getCaixasAbertos,
  getCaixasFechados,
  verificaCaixaAberto,
  getHistoricoCaixas,
};
