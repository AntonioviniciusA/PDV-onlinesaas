const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

// Configuração da impressora (ajuste a interface conforme necessário)
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON, // MP-4200 TH é compatível com EPSON ESC/POS
  interface: "usb", // ou 'COM3', '/dev/usb/lp0', etc
  characterSet: "PC860_PORTUGUESE",
  removeSpecialCharacters: false,
  lineCharacter: "=",
});

exports.imprimirCupom = async (req, res) => {
  const cupom = req.body;
  try {
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
    return res.json({ success: true, message: "Cupom impresso com sucesso." });
  } catch (err) {
    console.error("Erro ao imprimir cupom:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao imprimir cupom.",
      error: err.message,
    });
  }
};
