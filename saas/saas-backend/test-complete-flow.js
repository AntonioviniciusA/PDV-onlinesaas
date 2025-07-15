const axios = require("axios");
const { pool } = require("./src/config/database.js");

const API_BASE_URL = "http://localhost:5000/saas";

async function testCompleteFlow() {
  console.log("🧪 Testando fluxo completo de registro e bloqueio...\n");

  try {
    // 1. Registrar um novo cliente
    console.log("1️⃣ Registrando novo cliente...");
    const registerData = {
      razao_social: "Empresa Teste Completo LTDA",
      cnpj: "12345678000166",
      nome_representante: "Maria Completo",
      cpf: "12345678904",
      email: "teste.completo@exemplo.com",
      senha: "123456",
      telefone: "11999999996",
      endereco: "Rua Teste Completo, 123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-580",
    };

    try {
      const registerResponse = await axios.post(
        `${API_BASE_URL}/cliente/register`,
        registerData
      );
      console.log("✅ Cliente registrado:", registerResponse.data);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log("⚠️ Cliente já existe, continuando...");
      } else {
        console.log(
          "❌ Erro no registro:",
          error.response?.data || error.message
        );
        return;
      }
    }

    // 2. Verificar status no banco
    console.log("\n2️⃣ Verificando status no banco...");
    const email = "teste.completo@exemplo.com";

    const [rows] = await pool.query(
      "SELECT id, email, email_verificado FROM cliente WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      const cliente = rows[0];
      console.log("📊 Status do cliente:", {
        id: cliente.id,
        email: cliente.email,
        email_verificado: cliente.email_verificado,
        tipo: typeof cliente.email_verificado,
      });

      // 3. Tentar login (deve ser bloqueado)
      console.log("\n3️⃣ Tentando login (deve ser bloqueado)...");
      const loginData = {
        email: email,
        senha: "123456",
      };

      try {
        const loginResponse = await axios.post(
          `${API_BASE_URL}/cliente/login`,
          loginData
        );
        console.log(
          "❌ ERRO: Login foi permitido quando deveria ser bloqueado!"
        );
        console.log("Resposta:", loginResponse.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.log("✅ CORRETO: Login bloqueado para e-mail não verificado");
          console.log("Mensagem:", error.response.data.message);
        } else {
          console.log(
            "❌ Erro inesperado:",
            error.response?.data || error.message
          );
        }
      }
    } else {
      console.log("❌ Cliente não encontrado no banco");
    }

    console.log("\n🎉 Teste completo concluído!");
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  } finally {
    // Fechar conexão
    await pool.end();
  }
}

testCompleteFlow();
