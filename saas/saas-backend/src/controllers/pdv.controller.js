const { pool } = require("../config/database");

// Verificar se a assinatura está válida
const verificarLicenca = async (req, res) => {
  try {
    const idCliente = req.params.clienteId || req.headers["cliente-id"];
    if (!idCliente) {
      return res.status(400).json({
        success: false,
        message: "ID do cliente não informado",
      });
    }

    const result = await pool.query(
      `SELECT id, status, data_fim 
       FROM assinaturas 
       WHERE id_cliente = ? 
       ORDER BY data_fim DESC 
       LIMIT 1`,
      [idCliente]
    );

    const assinatura = result[0];

    if (!assinatura || assinatura.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Assinatura inativa ou não encontrada",
      });
    }

    const agora = new Date();
    const dataFim = new Date(assinatura.data_fim);

    if (dataFim < agora) {
      return res.status(403).json({
        success: false,
        message: "Assinatura expirada",
      });
    }

    return res.json({
      success: true,
      message: "Assinatura válida",
      dataExpiracao: dataFim,
    });
  } catch (err) {
    console.error("Erro ao verificar licença:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao verificar licença",
    });
  }
};

// Tempo restante até a expiração
const tempoRestanteAssinatura = async (req, res) => {
  try {
    const idCliente = req.query.clienteId || req.headers["cliente-id"];
    if (!idCliente) {
      return res.status(400).json({
        success: false,
        message: "ID do cliente não informado",
      });
    }

    const result = await pool.query(
      `SELECT status, data_fim 
       FROM assinaturas 
       WHERE id_cliente = ? 
       ORDER BY data_fim DESC 
       LIMIT 1`,
      [idCliente]
    );

    const assinatura = result[0];

    if (!assinatura || assinatura.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Assinatura inativa ou não encontrada",
      });
    }

    const agora = new Date();
    const dataFim = new Date(assinatura.data_fim);

    if (dataFim < agora) {
      return res.status(403).json({
        success: false,
        message: "Assinatura expirada",
        tempoRestante: 0,
      });
    }

    const diff = dataFim - agora;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    return res.json({
      success: true,
      tempoRestante: { dias, horas, minutos, segundos },
      dataExpiracao: dataFim,
    });
  } catch (err) {
    console.error("Erro ao calcular tempo restante:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao calcular tempo restante",
    });
  }
};

module.exports = {
  verificarLicenca,
  tempoRestanteAssinatura,
};
