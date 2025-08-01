const { pool } = require("../config/database.js");
const bcrypt = require("bcryptjs");
const {
  formatDateTimeInTimezone,
  getCurrentUTCDate,
} = require("../utils/timezoneUtils.js");
const LIMITE_CAIXAS_ABERTOS = 3; // Altere aqui se quiser outro limite

const abrirCaixa = async (req, res) => {
  let connection;
  try {
    const { amount, usuario, caixa_numero } = req.body;
    let operador = req.user;

    // Verificar se amount é válido
    if (!amount || (typeof amount === "object" && amount !== null)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Valor do caixa inválido ou não informado",
      });
    }

    const valor = Number(amount);

    if (isNaN(valor) || valor < 25) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Valor mínimo para abertura: R$ 25,00",
      });
    }
    if (!usuario?.id_loja || !usuario?.id || !valor) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "ID da loja, ID do usuário e valor são obrigatórios",
      });
    }
    if (!operador || !operador.id) {
      return res
        .status(401)
        .json({ sucesso: false, mensagem: "Usuário não autenticado" });
    }

    connection = await pool.getConnection();

    // Se não foi fornecido caixa_numero, buscar das configurações do sistema
    let numeroCaixa = caixa_numero;
    if (!numeroCaixa) {
      const [configuracoes] = await connection.query(
        "SELECT numero_caixa FROM configuracoes_sistema WHERE id_loja = ?",
        [usuario.id_loja]
      );
      numeroCaixa =
        configuracoes.length > 0 ? configuracoes[0].numero_caixa : 1;
    }

    // Garantir que numeroCaixa seja um número válido
    numeroCaixa = parseInt(numeroCaixa) || 1;
    if (numeroCaixa < 1) numeroCaixa = 1;

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

    // Verificar se o caixa já está aberto pelo operador
    if (numeroCaixa && usuario) {
      const [caixas] = await connection.query(
        "SELECT id FROM caixas WHERE caixa_numero = ? AND id_loja = ? AND operador_usuario_id = ? AND status = 'aberto'",
        [numeroCaixa, usuario.id_loja, operador.id]
      );
      if (caixas.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Caixa já esta aberto",
          id_caixa: caixas[0].id,
          caixa_numero: numeroCaixa,
          user_id: operador.id,
          valor_inicial: valor,
          status: "aberto",
          diferenca: 0,
          valor_final: 0,
          criado_em: new Date(),
        });
      }
    }

    // Verificar se o caixa já está aberto por outro usuário
    if (numeroCaixa && usuario) {
      const [caixaAberto] = await connection.query(
        "SELECT id, operador_usuario_id FROM caixas WHERE caixa_numero = ? AND id_loja = ? AND status = 'aberto'",
        [numeroCaixa, usuario.id_loja]
      );
      if (caixaAberto.length > 0) {
        if (caixaAberto[0].operador_usuario_id !== operador.id) {
          return res.status(400).json({
            sucesso: false,
            mensagem: "Caixa já esta aberto por outro usuario",
          });
        }
      }
    }

    // Verificar se já existe um caixa com esse número
    const [caixaExistente] = await connection.query(
      "SELECT id, status FROM caixas WHERE caixa_numero = ? AND id_loja = ?",
      [numeroCaixa, usuario.id_loja]
    );

    if (caixaExistente.length > 0) {
      const caixa = caixaExistente[0];

      if (caixa.status === "fechado") {
        // Se o caixa está fechado, reutilizar atualizando os dados
        const token = Array.from({ length: 20 }, () =>
          Math.floor(Math.random() * 10)
        ).join("");

        const [updateResult] = await connection.query(
          `UPDATE caixas SET 
           status = 'aberto', 
           valor_inicial = ?, 
           token = ?, 
           abertura_autorizador_id = ?, 
           operador_usuario_id = ?,
           fechamento_autorizador_id = NULL,
           criado_em = NOW(),
           atualizado_em = NOW()
           WHERE id = ?`,
          [valor, token, usuario.id, operador.id, caixa.id]
        );

        if (updateResult.affectedRows > 0) {
          const caixaData = {
            id: caixa.id,
            id_loja: usuario.id_loja,
            caixa_numero: numeroCaixa,
            status: "aberto",
            valor_inicial: valor,
            abertura_autorizador_id: usuario.id,
            operador_usuario_id: operador.id,
            token: token,
            criado_em: new Date(),
            atualizado_em: new Date(),
          };

          // Definir cookie com os dados do caixa
          res.cookie("caixa_session", JSON.stringify(caixaData), {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
          });

          return res.status(200).json({
            sucesso: true,
            mensagem: "Caixa reaberto com sucesso.",
            caixa: caixaData,
          });
        }
      } else {
        // Se o caixa está aberto, buscar próximo número disponível
        const [proximoCaixa] = await connection.query(
          "SELECT MAX(caixa_numero) as max_numero FROM caixas WHERE id_loja = ?",
          [usuario.id_loja]
        );
        numeroCaixa = (proximoCaixa[0].max_numero || 0) + 1;
        console.log(
          `Caixa número ${numeroCaixa} já está aberto, usando próximo número: ${numeroCaixa}`
        );
      }
    }

    // Abrir novo caixa (inserir)
    const token = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    const [caixa] = await connection.query(
      "INSERT INTO caixas (id_loja, caixa_numero, status, valor_inicial, token, abertura_autorizador_id, operador_usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        usuario.id_loja,
        numeroCaixa,
        "aberto",
        valor,
        token,
        usuario.id, // Usar o ID do usuário autorizador
        operador.id,
      ]
    );

    const caixaData = {
      id: caixa.insertId,
      id_loja: usuario.id_loja,
      caixa_numero: numeroCaixa,
      status: "aberto",
      valor_inicial: valor,
      abertura_autorizador_id: usuario.id,
      operador_usuario_id: operador.id,
      token: token,
      criado_em: new Date(),
      atualizado_em: new Date(),
    };

    // Definir cookie com os dados do caixa
    res.cookie("caixa_session", JSON.stringify(caixaData), {
      httpOnly: false, // Permitir acesso via JavaScript
      secure: process.env.NODE_ENV === "production", // HTTPS apenas em produção
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: "/",
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Caixa aberto com sucesso.",
      caixa: caixaData,
    });
  } catch (error) {
    console.error("Erro ao abrir caixa:", error);
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
    const { id_caixa, id_loja, amount, usuario } = req.body;
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

    // Usar o ID do usuário que está fazendo o fechamento
    const autorizadorId = usuario?.id || req.user?.id;

    // Atualizar status para fechado
    const [result] = await connection.query(
      "UPDATE caixas SET  status = 'fechado', valor_final = ?, fechamento_autorizador_id = ?, diferenca = ? WHERE id = ? AND id_loja = ? AND status = 'aberto'",
      [valor, autorizadorId, diferenca, id_caixa, id_loja]
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

    // Limpar cookie do caixa
    res.clearCookie("caixa_session", {
      path: "/",
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Caixa fechado com sucesso.",
      id_caixa: caixaFechado[0].id,
      id_loja: caixaFechado[0].id_loja,
      valor_inicial: caixaFechado[0].valor_inicial,
      fechamento_autorizador_id: caixaFechado[0].fechamento_autorizador_id,
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
    const { entrada } = req.body;
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
      if (
        !permissions.includes("pdv.authorize") &&
        !permissions.includes("*")
      ) {
        return res.status(403).json({
          sucesso: false,
          mensagem: "Usuário não tem permissão para autorizar",
        });
      }
      // Gerar código autorizador de 20 dígitos aleatórios
      const autorizador = Array.from({ length: 20 }, () =>
        Math.floor(Math.random() * 10)
      ).join("");
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
      "SELECT id, caixa_numero, status, valor_inicial, abertura_autorizador_id, operador_usuario_id, criado_em, atualizado_em FROM caixas WHERE status = 'aberto' AND id_loja = ?",
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
      "SELECT id, caixa_numero, status, valor_inicial, abertura_autorizador_id, operador_usuario_id, criado_em, atualizado_em FROM caixas WHERE status = 'fechado' AND id_loja = ?",
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

    // Tentar pegar dados do cookie
    let caixaData = null;
    try {
      if (req.cookies.caixa_session) {
        caixaData = JSON.parse(req.cookies.caixa_session);
      }
    } catch (error) {
      console.log("Erro ao parsear cookie do caixa:", error);
    }

    console.log("Dados do cookie caixa:", caixaData);

    if (!caixaData || !caixaData.token) {
      return res.status(200).json({ sucesso: false, caixa: null });
    }

    // Verificar se o caixa ainda está aberto no banco
    const [caixaAberto] = await connection.query(
      "SELECT * FROM caixas WHERE status = 'aberto' AND id_loja = ? AND token = ? AND id = ?",
      [req.user.id_loja, caixaData.token, caixaData.id]
    );

    if (caixaAberto.length > 0) {
      // Atualizar cookie com dados mais recentes do banco
      const caixaAtualizado = caixaAberto[0];
      res.cookie("caixa_session", JSON.stringify(caixaAtualizado), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      return res.status(200).json({ sucesso: true, caixa: caixaAtualizado });
    } else {
      // Caixa não está mais aberto, limpar cookie
      res.clearCookie("caixa_session", { path: "/" });
      return res.status(200).json({ sucesso: false, caixa: null });
    }
  } catch (error) {
    console.error("Erro ao verificar caixa aberto:", error);
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
  try {
    const { n_venda, data, forma_pagamento, caixa_operacao } = req.query;

    if (!req.user || !req.user.id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não autenticado ou sem loja",
      });
    }

    connection = await pool.getConnection();

    // Buscar configurações de timezone da loja
    const [configuracoes] = await connection.query(
      "SELECT timezone FROM configuracoes_sistema WHERE id_loja = ?",
      [req.user.id_loja]
    );

    const timezone =
      configuracoes.length > 0
        ? configuracoes[0].timezone
        : "America/Sao_Paulo";

    // Se o filtro de caixa em operação estiver ativo, buscar o caixa aberto
    let caixaOperacaoId = null;
    if (caixa_operacao === "true") {
      const [caixasAbertos] = await connection.query(
        "SELECT id FROM caixas WHERE status = 'aberto' AND id_loja = ? ORDER BY criado_em DESC LIMIT 1",
        [req.user.id_loja]
      );

      if (caixasAbertos.length > 0) {
        caixaOperacaoId = caixasAbertos[0].id;
      }
    }

    // Query base para buscar vendas com informações do operador
    let queryVendas = `
      SELECT 
        v.id,
        v.id_integracao,
        v.id_caixa,
        v.operador_usuario_id,
        v.data,
        v.total,
        v.desconto,
        v.status,
        v.tipo,
        v.forma_pagamento,
        v.parcelas,
        v.parcelas_pagas,
        v.parcelas_restantes,
        v.criado_em,
        v.atualizado_em,
        u.nome as operador_nome,
        c.caixa_numero
      FROM vendas v
      LEFT JOIN users u ON v.operador_usuario_id = u.id
      LEFT JOIN caixas c ON v.id_caixa = c.id
      WHERE v.id_loja = ?
    `;

    const valuesVendas = [req.user.id_loja];

    // Adiciona filtros dinamicamente
    if (n_venda) {
      queryVendas += " AND v.id_integracao LIKE ?";
      valuesVendas.push(`%${n_venda}%`);
    }

    if (data) {
      queryVendas += " AND DATE(v.data) = ?";
      valuesVendas.push(data);
    }

    if (forma_pagamento && forma_pagamento !== "todos") {
      queryVendas += " AND v.forma_pagamento = ?";
      valuesVendas.push(forma_pagamento);
    }

    // Filtro por caixa em operação
    if (caixaOperacaoId) {
      queryVendas += " AND v.id_caixa = ?";
      valuesVendas.push(caixaOperacaoId);
    }

    queryVendas += " ORDER BY v.criado_em DESC";

    const [vendas] = await connection.query(queryVendas, valuesVendas);

    // Para cada venda, buscar os itens e formatar datas no timezone correto
    const vendasComItens = await Promise.all(
      vendas.map(async (venda) => {
        const [itens] = await connection.query(
          `SELECT 
            vi.id,
            vi.produto_codigo,
            vi.descricao,
            vi.quantidade,
            vi.valor_unitario,
            vi.valor_total,
            vi.peso,
            vi.unidade
          FROM venda_itens vi
          WHERE vi.venda_id = ? AND vi.id_loja = ?
          ORDER BY vi.id`,
          [venda.id, req.user.id_loja]
        );

        // Formatar datas no timezone da loja
        const criadoEmFormatado = formatDateTimeInTimezone(
          venda.criado_em,
          timezone
        );

        const atualizadoEmFormatado = formatDateTimeInTimezone(
          venda.atualizado_em,
          timezone
        );

        return {
          ...venda,
          // Manter timestamps originais em UTC
          criado_em_utc: venda.criado_em,
          atualizado_em_utc: venda.atualizado_em,
          // Adicionar datas formatadas no timezone local
          criado_em_formatado: criadoEmFormatado,
          atualizado_em_formatado: atualizadoEmFormatado,
          timezone: timezone,
          itens: itens,
        };
      })
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Histórico de vendas encontrado",
      vendas: vendasComItens,
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de vendas:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar histórico de vendas",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const finalizarVenda = async (req, res) => {
  let connection;
  try {
    const {
      cart,
      total,
      discount,
      discountType,
      discountValue,
      paymentMethod,
      selectedCardType,
      mixedPayments,
      receivedAmount,
      changeAmount,
      receiptType,
      user,
      pixPaymentConfirmed,
      caixaId,
      isOnline = true,
    } = req.body;

    // Validações básicas
    if (!cart || cart.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Carrinho vazio",
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Valor total inválido",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não autenticado",
      });
    }

    // Verificar se o usuário tem id_loja
    if (!req.user.id_loja) {
      console.log("Usuário sem id_loja, usando padrão");
      req.user.id_loja = "00000000-0000-0000-0000-000000000000";
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Gerar ID de integração único
      const idIntegracao = `VDA${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Determinar forma de pagamento final
      let formaPagamentoFinal = paymentMethod;
      if (mixedPayments && mixedPayments.length > 0) {
        formaPagamentoFinal = "misto";
      } else if (paymentMethod === "cartao" && selectedCardType) {
        formaPagamentoFinal = selectedCardType;
      }

      // Calcular desconto
      const descontoFinal =
        discountType === "percentage"
          ? (total * discount) / 100
          : discountValue || 0;

      // 1. Salvar venda na tabela vendas
      const [vendaResult] = await connection.query(
        `INSERT INTO vendas (
          id_loja, id_integracao, id_caixa, operador_usuario_id, 
          data, total, desconto, status, tipo, forma_pagamento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id_loja,
          idIntegracao,
          caixaId || 1, // Usar caixa padrão se não especificado
          req.user.id,
          getCurrentUTCDate(), // Data atual em UTC (YYYY-MM-DD)
          total,
          descontoFinal,
          "pago",
          "venda",
          formaPagamentoFinal,
        ]
      );

      const vendaId = vendaResult.insertId;

      // 2. Salvar itens da venda
      for (const item of cart) {
        await connection.query(
          `INSERT INTO venda_itens (
            id_loja, venda_id, produto_codigo, descricao, 
            quantidade, valor_unitario, valor_total, peso, unidade
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id_loja,
            vendaId,
            item.codigo || item.codigo_barras,
            item.descricao || item.name,
            item.quantity,
            item.preco_venda || item.price,
            item.totalPrice,
            item.weight || 0,
            item.unidade || item.unit || "UN",
          ]
        );
      }

      // 3. Preparar dados do cupom/recibo
      const cupomData = {
        id: vendaId,
        numero: idIntegracao,
        timestamp: new Date().toISOString(),
        items: cart,
        total: total,
        discount: discount,
        discountType: discountType,
        discountValue: discountValue,
        paymentMethod: paymentMethod,
        selectedCardType: selectedCardType,
        mixedPayments: mixedPayments,
        receivedAmount: receivedAmount,
        changeAmount: changeAmount,
        receiptType: receiptType,
        user: user,
        pixPaymentConfirmed: pixPaymentConfirmed,
      };

      // 4. Salvar cupom na tabela cupom
      await connection.query(
        `INSERT INTO cupom (
          id_loja, numero, user_nome, timestamp, total, desconto, 
          payment_method, received_amount, change_amount, itens, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id_loja,
          idIntegracao,
          user?.name || req.user.nome,
          new Date(),
          total,
          descontoFinal,
          formaPagamentoFinal,
          receivedAmount || 0,
          changeAmount || 0,
          JSON.stringify(cart),
          isOnline ? "online" : "offline",
        ]
      );

      // // 5. Chamar função de impressão baseada no tipo de recibo
      // let printResult = null;
      // try {
      //   const {
      //     imprimirCupomThermal,
      //     imprimirReciboThermal,
      //     imprimirCupomOffline,
      //     imprimirReciboOffline,
      //   } = require("./cupom.controller.js");

      //   // Criar objetos mock de req e res para as funções de impressão
      //   const mockReq = { body: cupomData };
      //   const mockRes = {
      //     json: (data) => {
      //       printResult = data;
      //       return mockRes;
      //     },
      //     status: (code) => mockRes,
      //   };

      //   if (isOnline) {
      //     if (receiptType === "fiscal") {
      //       await imprimirCupomThermal(mockReq, mockRes);
      //     } else {
      //       await imprimirReciboThermal(mockReq, mockRes);
      //     }
      //   } else {
      //     if (receiptType === "fiscal") {
      //       await imprimirCupomOffline(mockReq, mockRes);
      //     } else {
      //       await imprimirReciboOffline(mockReq, mockRes);
      //     }
      //   }
      // } catch (printError) {
      //   console.error("Erro na impressão:", printError);
      //   // Não falhar a venda se a impressão falhar
      // }

      await connection.commit();

      return res.status(200).json({
        sucesso: true,
        mensagem: "Venda finalizada com sucesso",
        venda: {
          id: vendaId,
          idIntegracao: idIntegracao,
          total: total,
          desconto: descontoFinal,
          formaPagamento: formaPagamentoFinal,
          status: "pago",
          criadoEm: new Date(),
        },
        impressao: printResult,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Erro ao finalizar venda:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao finalizar venda",
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
  finalizarVenda,
};
