const { pool } = require("../config/database.js");

/**
 * Buscar configurações do sistema
 */
const getConfiguracoes = async (req, res) => {
  let connection;
  try {
    if (!req.user || !req.user.id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não autenticado ou sem loja",
      });
    }

    connection = await pool.getConnection();

    const [configuracoes] = await connection.query(
      "SELECT * FROM configuracoes_sistema WHERE id_loja = ?",
      [req.user.id_loja]
    );

    if (configuracoes.length === 0) {
      // Criar configuração padrão se não existir
      const [result] = await connection.query(
        `INSERT INTO configuracoes_sistema (
          id_loja, link_api_cupom, timezone
        ) VALUES (?, ?, ?)`,
        [
          req.user.id_loja,
          "http://localhost:3000/api/cupom",
          "America/Sao_Paulo",
        ]
      );

      return res.status(200).json({
        sucesso: true,
        mensagem: "Configurações criadas com sucesso",
        configuracoes: {
          id: result.insertId,
          id_loja: req.user.id_loja,
          link_api_cupom: "http://localhost:3000/api/cupom",
          timezone: "America/Sao_Paulo",
          atualizado_em: new Date(),
        },
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Configurações encontradas",
      configuracoes: configuracoes[0],
    });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar configurações",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Atualizar configurações do sistema
 */
const updateConfiguracoes = async (req, res) => {
  let connection;
  try {
    const { link_api_cupom, timezone } = req.body;

    if (!req.user || !req.user.id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não autenticado ou sem loja",
      });
    }

    connection = await pool.getConnection();

    // Verificar se configuração existe
    const [existentes] = await connection.query(
      "SELECT id FROM configuracoes_sistema WHERE id_loja = ?",
      [req.user.id_loja]
    );

    if (existentes.length === 0) {
      // Criar nova configuração
      const [result] = await connection.query(
        `INSERT INTO configuracoes_sistema (
          id_loja, link_api_cupom, timezone
        ) VALUES (?, ?, ?)`,
        [
          req.user.id_loja,
          link_api_cupom || "http://localhost:3000/api/cupom",
          timezone || "America/Sao_Paulo",
        ]
      );

      return res.status(201).json({
        sucesso: true,
        mensagem: "Configurações criadas com sucesso",
        configuracoes: {
          id: result.insertId,
          id_loja: req.user.id_loja,
          link_api_cupom: link_api_cupom || "http://localhost:3000/api/cupom",
          timezone: timezone || "America/Sao_Paulo",
          atualizado_em: new Date(),
        },
      });
    } else {
      // Atualizar configuração existente
      const [result] = await connection.query(
        `UPDATE configuracoes_sistema SET 
          link_api_cupom = ?, 
          timezone = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id_loja = ?`,
        [
          link_api_cupom || "http://localhost:3000/api/cupom",
          timezone || "America/Sao_Paulo",
          req.user.id_loja,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Configurações não encontradas",
        });
      }

      // Buscar configurações atualizadas
      const [configuracoes] = await connection.query(
        "SELECT * FROM configuracoes_sistema WHERE id_loja = ?",
        [req.user.id_loja]
      );

      return res.status(200).json({
        sucesso: true,
        mensagem: "Configurações atualizadas com sucesso",
        configuracoes: configuracoes[0],
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar configurações",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Listar timezones disponíveis
 */
const getTimezones = async (req, res) => {
  try {
    // Lista de timezones brasileiros mais comuns
    const timezones = [
      { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
      { value: "America/Manaus", label: "Manaus (UTC-4)" },
      { value: "America/Belem", label: "Belém (UTC-3)" },
      { value: "America/Fortaleza", label: "Fortaleza (UTC-3)" },
      { value: "America/Recife", label: "Recife (UTC-3)" },
      { value: "America/Maceio", label: "Maceió (UTC-3)" },
      { value: "America/Aracaju", label: "Aracaju (UTC-3)" },
      { value: "America/Salvador", label: "Salvador (UTC-3)" },
      { value: "America/Bahia", label: "Bahia (UTC-3)" },
      { value: "America/Maceio", label: "Maceió (UTC-3)" },
      { value: "America/Recife", label: "Recife (UTC-3)" },
      { value: "America/Fortaleza", label: "Fortaleza (UTC-3)" },
      { value: "America/Belem", label: "Belém (UTC-3)" },
      { value: "America/Manaus", label: "Manaus (UTC-4)" },
      { value: "America/Porto_Velho", label: "Porto Velho (UTC-4)" },
      { value: "America/Rio_Branco", label: "Rio Branco (UTC-5)" },
      { value: "America/Boa_Vista", label: "Boa Vista (UTC-4)" },
      { value: "America/Cuiaba", label: "Cuiabá (UTC-4)" },
      { value: "America/Campo_Grande", label: "Campo Grande (UTC-4)" },
      { value: "America/Goiania", label: "Goiânia (UTC-3)" },
      { value: "America/Brasilia", label: "Brasília (UTC-3)" },
      { value: "America/Vitoria", label: "Vitória (UTC-3)" },
      { value: "America/Rio_de_Janeiro", label: "Rio de Janeiro (UTC-3)" },
      { value: "America/Santarem", label: "Santarém (UTC-3)" },
      { value: "America/Palmas", label: "Palmas (UTC-3)" },
      { value: "America/Araguaina", label: "Araguaína (UTC-3)" },
      { value: "America/Sao_Luis", label: "São Luís (UTC-3)" },
      { value: "America/Teresina", label: "Teresina (UTC-3)" },
      { value: "America/Natal", label: "Natal (UTC-3)" },
      { value: "America/Joao_Pessoa", label: "João Pessoa (UTC-3)" },
      { value: "America/Maceio", label: "Maceió (UTC-3)" },
      { value: "America/Recife", label: "Recife (UTC-3)" },
      { value: "America/Fortaleza", label: "Fortaleza (UTC-3)" },
      { value: "America/Belem", label: "Belém (UTC-3)" },
      { value: "America/Manaus", label: "Manaus (UTC-4)" },
      { value: "America/Porto_Velho", label: "Porto Velho (UTC-4)" },
      { value: "America/Rio_Branco", label: "Rio Branco (UTC-5)" },
      { value: "America/Boa_Vista", label: "Boa Vista (UTC-4)" },
      { value: "America/Cuiaba", label: "Cuiabá (UTC-4)" },
      { value: "America/Campo_Grande", label: "Campo Grande (UTC-4)" },
      { value: "America/Goiania", label: "Goiânia (UTC-3)" },
      { value: "America/Brasilia", label: "Brasília (UTC-3)" },
      { value: "America/Vitoria", label: "Vitória (UTC-3)" },
      { value: "America/Rio_de_Janeiro", label: "Rio de Janeiro (UTC-3)" },
      { value: "America/Santarem", label: "Santarém (UTC-3)" },
      { value: "America/Palmas", label: "Palmas (UTC-3)" },
      { value: "America/Araguaina", label: "Araguaína (UTC-3)" },
      { value: "America/Sao_Luis", label: "São Luís (UTC-3)" },
      { value: "America/Teresina", label: "Teresina (UTC-3)" },
      { value: "America/Natal", label: "Natal (UTC-3)" },
      { value: "America/Joao_Pessoa", label: "João Pessoa (UTC-3)" },
    ];

    // Remover duplicatas
    const uniqueTimezones = timezones.filter(
      (tz, index, self) => index === self.findIndex((t) => t.value === tz.value)
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Timezones disponíveis",
      timezones: uniqueTimezones,
    });
  } catch (error) {
    console.error("Erro ao buscar timezones:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar timezones",
      erro: error.message,
    });
  }
};

module.exports = {
  getConfiguracoes,
  updateConfiguracoes,
  getTimezones,
};
