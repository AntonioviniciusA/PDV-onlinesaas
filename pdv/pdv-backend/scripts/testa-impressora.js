const { pool } = require("../config/database");
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

async function getPrinterConfig() {
  const connection = await pool.getConnection();
  const [rows] = await connection.query(
    "SELECT * FROM impressora_config LIMIT 1"
  );
  connection.release();
  return rows[0];
}

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

async function main() {
  try {
    const printer = await createPrinter();
    printer.clear();
    printer.alignCenter();
    printer.println("=== TESTE DE IMPRESSÃO ===");
    printer.drawLine();
    printer.alignLeft();
    printer.println(`Data: ${new Date().toLocaleString("pt-BR")}`);
    printer.println("Mensagem: Impressora conectada e configurada!");
    printer.drawLine();
    printer.println("Obrigado por usar o PDV!");
    printer.cut();
    await printer.execute();
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      console.error("Impressora não conectada!");
      process.exit(1);
    }
    console.log("✅ Teste de impressão enviado com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao testar impressora:", err.message);
    process.exit(1);
  }
}

main();
