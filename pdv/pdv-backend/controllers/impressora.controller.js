const { pool } = require("../config/database");
const { ThermalPrinter, PrinterTypes } = require("node-thermal-printer");

// Lista impressoras disponíveis no sistema
const listarImpressoras = (req, res) => {
  try {
    const impressoras = ThermalPrinter.getPrinters().map((p) => p.name);
    console.log("impressoras", impressoras);
    res.json({ success: true, printers: impressoras });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Salva configuração da impressora no banco
const salvarImpressoraConfig = async (req, res) => {
  const {
    type,
    name,
    interface: iface,
    characterSet,
    removeSpecialCharacters,
    lineCharacter,
  } = req.body;
  try {
    const id_loja = "00000000-0000-0000-0000-000000000000"; // Ajuste conforme multi-loja
    await pool.query(
      `REPLACE INTO impressora_config (id_loja, interface, type, characterSet, removeSpecialCharacters, lineCharacter) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_loja,
        iface,
        type,
        characterSet,
        !!removeSpecialCharacters,
        lineCharacter,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Busca configuração da impressora no banco
const getImpressoraConfig = async (req, res) => {
  try {
    const id_loja = "00000000-0000-0000-0000-000000000000";
    const [rows] = await pool.query(
      "SELECT * FROM impressora_config WHERE id_loja = ? LIMIT 1",
      [id_loja]
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Nenhuma impressora configurada" });
    res.json({ success: true, config: rows[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar configuração da impressora",
      error: error.message,
    });
  }
};

// Função utilitária para uso interno
async function getPrinterConfig() {
  const id_loja = "00000000-0000-0000-0000-000000000000";
  const [rows] = await pool.query(
    "SELECT * FROM impressora_config WHERE id_loja = ? LIMIT 1",
    [id_loja]
  );
  if (!rows.length) throw new Error("Nenhuma impressora configurada");
  return rows[0];
}

module.exports = {
  listarImpressoras,
  salvarImpressoraConfig,
  getImpressoraConfig,
  getPrinterConfig,
};
