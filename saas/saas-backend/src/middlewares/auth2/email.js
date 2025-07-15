const nodemailer = require("nodemailer");

async function enviarCodigoEmail(destinatario, codigo) {
  // Verificar se as variáveis de ambiente estão configuradas
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      "⚠️ Variáveis de email não configuradas. Usando modo de teste."
    );

    // Modo de teste - apenas loga o código
    console.log(`📧 Código de verificação para ${destinatario}: ${codigo}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="background-color:#000; color:#fff; font-family:sans-serif; padding:20px; text-align:center;">
      <h1 style="margin-bottom:20px;">🔐 Verificação de Segurança</h1>
      <p style="font-size:16px; margin-bottom:30px;">
        Olá! Aqui está seu código de verificação para acessar sua conta:
      </p>
      <div style="font-size:32px; font-weight:bold; margin-bottom:30px; background:#111; padding:15px; display:inline-block; border-radius:5px;">
        ${codigo}
      </div>
      <p style="font-size:14px; color:#aaa;">
        Este código é válido por apenas alguns minutos. Não compartilhe com ninguém.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"MinhaApp" <' + process.env.EMAIL_USER + ">",
      to: destinatario,
      subject: "Código de Verificação",
      html: htmlContent,
    });
    console.log(`✅ Email enviado com sucesso para ${destinatario}`);
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    // Em modo de desenvolvimento, apenas loga o código
    if (process.env.NODE_ENV === "development") {
      console.log(
        `📧 [DEV] Código de verificação para ${destinatario}: ${codigo}`
      );
    }
    throw error;
  }
}

module.exports = { enviarCodigoEmail };
