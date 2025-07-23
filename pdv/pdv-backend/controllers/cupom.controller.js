const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const { pool } = require("../config/database");
const axios = require("axios");

// Cache e função para buscar e recarregar o link da API do cupom
global.apiCupomUrlCache = null;

async function loadApiCupomUrl() {
  const id_loja = "00000000-0000-0000-0000-000000000000"; // Ajuste conforme multi-loja
  const [rows] = await pool.query(
    "SELECT link_api_cupom FROM configuracoes_sistema WHERE id_loja = ? ORDER BY atualizado_em DESC LIMIT 1",
    [id_loja]
  );
  if (!rows.length || !rows[0].link_api_cupom) {
    throw new Error("Configuração de link_api_cupom não encontrada");
  }
  global.apiCupomUrlCache = rows[0].link_api_cupom;
}

function getApiCupomUrl() {
  if (!global.apiCupomUrlCache) throw new Error("API Cupom URL não carregada");
  return global.apiCupomUrlCache;
}

// Exporte a função para recarregar se necessário em outro lugar
module.exports.loadApiCupomUrl = loadApiCupomUrl;

// Configuração da impressora (agora dinâmica)
async function createPrinter() {
  const config = await getPrinterConfig();
  return new ThermalPrinter({
    type: PrinterTypes[config.type],
    interface: config.interface,
    characterSet: config.characterSet,
    removeSpecialCharacters: !!config.removeSpecialCharacters,
    lineCharacter: config.lineCharacter,
  });
}

const imprimirCupomThermal = async (req, res) => {
  const cupom = req.body;
  try {
    // Usar o valor em cache
    const urlApiCupom = getApiCupomUrl();
    // Enviar cupom para API externa (ajuste a URL conforme necessário)
    const apiResponse = await axios.post(urlApiCupom, cupom);
    // Salvar cupom na tabela cupom
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `INSERT INTO cupom (numero, user_nome, timestamp, total, desconto, payment_method, received_amount, change_amount, itens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cupom.numero || null,
          cupom.user?.name || null,
          new Date(cupom.timestamp),
          cupom.total || 0,
          cupom.discountValue || 0,
          cupom.paymentMethod || null,
          cupom.receivedAmount || 0,
          cupom.changeAmount || 0,
          JSON.stringify(cupom.items || []),
        ]
      );
    } finally {
      connection.release();
    }
    // Impressão
    const printer = await createPrinter();
    printer.clear();
    printer.alignCenter();
    printer.println(`Recibo nº ${cupom.id || cupom.numero}`);
    printer.drawLine();
    printer.alignLeft();
    printer.println(`Operador: ${cupom.user?.name || "N/A"}`);
    printer.println(
      `Data: ${new Date(cupom.timestamp).toLocaleString("pt-BR")}`
    );
    printer.drawLine();
    printer.println("Itens:");
    for (const item of cupom.items) {
      printer.println(
        `${item.name} x${item.quantity}  R$${
          item.totalPrice?.toFixed(2) || item.valor?.toFixed(2)
        }`
      );
    }
    printer.drawLine();
    printer.bold(true);
    printer.println(`Total: R$ ${cupom.total.toFixed(2)}`);
    printer.bold(false);
    printer.drawLine();
    if (cupom.discount && cupom.discount > 0) {
      printer.println(
        `Desconto: ${
          cupom.discountType === "percentage"
            ? cupom.discount + "%"
            : "R$ " + cupom.discountValue.toFixed(2)
        }`
      );
    }
    if (cupom.paymentMethod) {
      printer.println(`Pagamento: ${cupom.paymentMethod}`);
    }
    if (cupom.receivedAmount) {
      printer.println(`Recebido: R$ ${cupom.receivedAmount.toFixed(2)}`);
    }
    if (cupom.changeAmount !== undefined) {
      printer.println(`Troco: R$ ${cupom.changeAmount.toFixed(2)}`);
    }
    printer.drawLine();
    printer.println("Obrigado pela preferência!");
    printer.cut();
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      return res
        .status(500)
        .json({ success: false, message: "Impressora não conectada." });
    }
    await printer.execute();
    return res.json({
      success: true,
      message: "Cupom impresso com sucesso.",
      apiResponse: apiResponse.data,
    });
  } catch (err) {
    console.error("Erro ao imprimir cupom:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao imprimir cupom.",
      error: err.message,
    });
  }
};

const imprimirReciboThermal = async (req, res) => {
  const recibo = req.body;
  console.log(recibo);
  let connection;
  try {
    // Função para gerar um identificador alfanumérico de 12 dígitos
    function gerarIdentificadorRecibo() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    const numero = gerarIdentificadorRecibo();
    connection = await pool.getConnection();
    // Salvar recibo
    const [reciboResult] = await connection.query(
      `INSERT INTO recibos (numero, cliente, data, total, id_integracao, natureza, cpfcnpj_emitente, cpfcnpj_destinatario, responsavel_cpfcnpj, responsavel_nome, responsavel_email, responsavel_ddd, responsavel_telefone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero,
        recibo.cliente || null,
        recibo.timestamp,
        recibo.total,
        recibo.id_integracao || null,
        recibo.natureza || null,
        recibo.cpfcnpj_emitente || null,
        recibo.cpfcnpj_destinatario || null,
        recibo.responsavel_cpfcnpj || null,
        recibo.responsavel_nome || null,
        recibo.responsavel_email || null,
        recibo.responsavel_ddd || null,
        recibo.responsavel_telefone || null,
      ]
    );
    const reciboId = reciboResult.insertId;
    // Salvar itens do recibo
    if (Array.isArray(recibo.items)) {
      for (const item of recibo.items) {
        await connection.query(
          `INSERT INTO recibo_itens (recibo_id, descricao, quantidade, valor_unitario) VALUES (?, ?, ?, ?)`,
          [reciboId, item.descricao, item.quantidade, item.valor_unitario]
        );
      }
    }
    // Impressão (igual ao cupom, mas sem QR code)
    const printer = await createPrinter();
    printer.clear();
    printer.alignCenter();
    printer.println(`Recibo nº ${numero}`);
    printer.drawLine();
    printer.alignLeft();
    printer.println(`Cliente: ${recibo.cliente}`);
    printer.println(
      `Data: ${new Date(recibo.timestamp).toLocaleDateString("pt-BR")}`
    );
    printer.drawLine();
    printer.println("Itens:");
    for (const item of recibo.items) {
      printer.println(
        `${item.descricao} x${item.quantidade}  R$${item.valor_unitario.toFixed(
          2
        )}`
      );
    }
    printer.drawLine();
    printer.bold(true);
    printer.println(`Total: R$ ${recibo.total.toFixed(2)}`);
    printer.bold(false);
    printer.drawLine();
    printer.println("Obrigado pela preferência!");
    printer.cut();
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      return res
        .status(500)
        .json({ success: false, message: "Impressora não conectada." });
    }
    await printer.execute();
    return res.json({
      success: true,
      message: "Recibo impresso e salvo com sucesso.",
    });
  } catch (err) {
    console.error("Erro ao imprimir recibo:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao imprimir recibo.",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const imprimirCupomOffline = async (req, res) => {
  const cupom = req.body;
  console.log(cupom);
  return res.json({ success: true, message: "Cupom impresso com sucesso." });
};

const imprimirReciboOffline = async (req, res) => {
  const recibo = req.body;

  try {
    const printer = await createPrinter();
    printer.clear();
    printer.alignCenter();
    printer.println(`Recibo nº ${recibo.numero || "OFFLINE"}`);
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Cliente: ${recibo.cliente || "N/A"}`);
    printer.println(
      `Data: ${
        recibo.timestamp
          ? new Date(recibo.timestamp).toLocaleDateString("pt-BR")
          : new Date().toLocaleDateString("pt-BR")
      }`
    );

    printer.drawLine();
    printer.println("Itens:");

    if (Array.isArray(recibo.items)) {
      for (const item of recibo.items) {
        const descricao = item.descricao || "Item";
        const quantidade = item.quantidade ?? 1;
        const valor = Number(item.valor_unitario) || 0;

        printer.println(`${descricao} x${quantidade}  R$${valor.toFixed(2)}`);
      }
    }

    printer.drawLine();
    printer.bold(true);
    const total = Number(recibo.total) || 0;
    printer.println(`Total: R$ ${total.toFixed(2)}`);
    printer.bold(false);
    printer.drawLine();
    printer.println("Obrigado pela preferência!");
    printer.cut();

    await printer.execute(); // primeiro executa
    const isConnected = await printer.isPrinterConnected(); // depois checa conexão

    if (!isConnected) {
      return res
        .status(500)
        .json({ success: false, message: "Impressora não conectada." });
    }

    return res.json({
      success: true,
      message: "Recibo impresso com sucesso (offline).",
    });
  } catch (err) {
    console.error("Erro ao imprimir recibo offline:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao imprimir recibo offline.",
      error: err.message,
    });
  }
};

module.exports = {
  imprimirCupomThermal,
  imprimirReciboThermal,
  imprimirCupomOffline,
  imprimirReciboOffline,
};
