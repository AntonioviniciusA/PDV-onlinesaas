const pkg = require("whatsapp-web.js");
const { Client, LocalAuth } = pkg;

const client = new Client({ authStrategy: new LocalAuth() });

client.initialize();

async function enviarCodigoZap(numeroComDDD, codigo) {
  const zapId = numeroComDDD + "@c.us";
  await client.sendMessage(zapId, `Seu código de verificação é: ${codigo}`);
}

module.exports = { enviarCodigoZap };
