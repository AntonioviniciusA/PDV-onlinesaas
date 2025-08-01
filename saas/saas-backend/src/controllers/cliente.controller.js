const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database.js");
const { createClienteDatabase } = require("../config/cdatabase.js");

const JWT_SECRET = process.env.JWT_SECRET;

// Registro de cliente
const registerCliente = async (req, res) => {
  try {
    const {
      razao_social,
      cnpj,
      nome_representante,
      cpf,
      email,
      senha,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      pais,
    } = req.body;
    if (
      !razao_social ||
      !cnpj ||
      !nome_representante ||
      !cpf ||
      !email ||
      !senha ||
      !telefone ||
      !endereco ||
      !cidade ||
      !estado ||
      !cep ||
      !pais
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos obrigatórios devem ser preenchidos.",
      });
    }
    // Verifica se já existe cliente com o mesmo email, cpf ou cnpj
    const [clienteExistente] = await pool.query(
      "SELECT * FROM cliente WHERE email = ? OR cpf = ? OR cnpj = ?",
      [email, cpf, cnpj]
    );
    if (clienteExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: "E-mail, CPF ou CNPJ já cadastrado.",
      });
    }
    // Criptografa a senha
    const hashSenha = await bcrypt.hash(senha, 10);
    // Cria novo cliente
    const id = uuidv4();
    await pool.query(
      `INSERT INTO cliente 
        (id, razao_social, cnpj, nome_representante, cpf, email, senha, telefone, endereco, cidade, estado, cep, pais, ativo, email_verificado ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, false)`,
      [
        id,
        razao_social || null,
        cnpj,
        nome_representante,
        cpf,
        email,
        hashSenha,
        telefone,
        endereco,
        cidade,
        estado,
        cep,
        pais,
      ]
    );
    //criar banco de dados separado para o cliente
    await createClienteDatabase(id);
    return res.status(201).json({
      success: true,
      message: "Cliente cadastrado com sucesso.",
    });
  } catch (err) {
    console.error("Erro no registro de cliente:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao registrar cliente.",
    });
  }
};

// Login de cliente
const loginCliente = async (req, res) => {
  try {
    console.log("🔐 Iniciando login de cliente...");
    const { email, senha } = req.body;
    console.log("📧 Email recebido:", email);

    if (!email || !senha) {
      console.log("❌ Email ou senha não fornecidos");
      return res.status(400).json({
        success: false,
        message: "E-mail e senha são obrigatórios.",
      });
    }
    // Busca cliente pelo email
    console.log("🔍 Buscando cliente no banco...");
    const [clienteRows] = await pool.query(
      "SELECT * FROM cliente WHERE email = ?",
      [email]
    );
    console.log("📊 Clientes encontrados:", clienteRows.length);

    if (clienteRows.length === 0) {
      console.log("❌ Cliente não encontrado");
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }
    const cliente = clienteRows[0];
    console.log("✅ Cliente encontrado:", {
      id: cliente.id,
      email: cliente.email,
    });
    // Compara senha
    const senhaCorreta = await bcrypt.compare(senha, cliente.senha);
    console.log("🔐 Verificação de senha:", {
      senhaFornecida: senha ? "sim" : "não",
      senhaHash: cliente.senha ? "sim" : "não",
      senhaCorreta,
    });
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }
    // Verifica se o e-mail está verificado
    console.log("🔍 Verificando status do email:", cliente.email_verificado);
    if (cliente.email_verificado === 0) {
      return res.status(403).json({
        success: false,
        message:
          "E-mail não verificado. Verifique seu e-mail antes de fazer login.",
      });
    }
    // Verifica se dupla autenticação está ativa
    if (cliente.dupla_autenticacao) {
      // Gera código e envia para o e-mail (ou WhatsApp se preferir)
      const codigo = Math.floor(100000 + Math.random() * 900000);
      const expiracao = new Date(Date.now() + 5 * 60000); // 5 minutos
      await pool.query(
        "INSERT INTO codigos_verificacao (id_cliente, codigo, expiracao) VALUES (?, ?, ?)",
        [cliente.id, codigo, expiracao]
      );
      try {
        await enviarCodigoEmail(cliente.email, codigo); // ou enviarCodigoZap(cliente.telefone, codigo)
        return res.status(401).json({
          success: false,
          message: "Código de dupla autenticação enviado.",
          etapa: "dupla_autenticacao",
          id_cliente: cliente.id,
          email: cliente.email,
        });
      } catch (emailError) {
        console.error("Erro ao enviar email:", emailError);
        // Em desenvolvimento, permitir login mesmo sem email configurado
        if (process.env.NODE_ENV === "development") {
          console.log("🔧 Modo desenvolvimento: Pulando dupla autenticação");
        } else {
          return res.status(500).json({
            success: false,
            message: "Erro ao enviar código de autenticação. Tente novamente.",
          });
        }
      }
    }
    // Gera token JWT
    const token = jwt.sign(
      {
        id: cliente.id,
        email: cliente.email,
        nome: cliente.nome_representante,
        tipo: "cliente",
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Gera código de acesso de 6 dígitos
    const codigoAcesso = Math.floor(100000 + Math.random() * 900000);
    const dataExpiracao = new Date(Date.now() + 30 * 60000); // 30 minutos

    // Salva o código de acesso no banco
    await pool.query(
      "INSERT INTO codigos_acesso (id_cliente, codigo, tipo_usuario, data_expiracao, ip_geracao, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
      [
        cliente.id,
        codigoAcesso,
        "cliente",
        dataExpiracao,
        req.ip || req.connection.remoteAddress,
        req.headers["user-agent"] || null,
      ]
    );

    // Atualiza último login
    await pool.query("UPDATE cliente SET ultimo_login = NOW() WHERE id = ?", [
      cliente.id,
    ]);

    // Retorna dados do cliente (sem senha) e o código de acesso
    return res.json({
      success: true,
      token,
      codigo_acesso: codigoAcesso,
      user: {
        id: cliente.id,
        razao_social: cliente.razao_social,
        cnpj: cliente.cnpj,
        nome_representante: cliente.nome_representante,
        cpf: cliente.cpf,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep,
        pais: cliente.pais,
        ativo: cliente.ativo,
      },
    });
  } catch (err) {
    console.error("Erro no login de cliente:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao fazer login.",
    });
  }
};
// Função para obter o perfil do cliente junto com informações da assinatura
const getProfile = async (req, res) => {
  try {
    // Recupera o ID do cliente a partir do token JWT
    const clienteId = req.user.id;
    console.log("clienteId", clienteId);
    if (!clienteId) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado.",
      });
    }

    // Busca os dados do cliente
    const [clientes] = await pool.query("SELECT * FROM cliente WHERE id = ?", [
      clienteId,
    ]);
    if (!clientes || clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente não encontrado.",
      });
    }
    const cliente = clientes[0];

    // Retorna o perfil completo
    return res.json({
      success: true,
      profile: cliente,
    });
  } catch (err) {
    console.error("Erro ao buscar perfil do cliente:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar perfil.",
    });
  }
};
const updateProfile = async (req, res) => {
  const { id } = req.user;
  const {
    nome_representante,
    email,
    telefone,
    endereco,
    cidade,
    estado,
    cep,
    pais,
  } = req.body;
  const [cliente] = await pool.query(
    "UPDATE cliente SET nome_representante = ?, email = ?, telefone = ?, endereco = ?, cidade = ?, estado = ?, cep = ?, pais = ? WHERE id = ?",
    [
      nome_representante,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      pais,
      id,
    ]
  );
  console.log("cliente", cliente);
  return res.json({ success: true, message: "Perfil atualizado com sucesso." });
};

// Função para enviar código de verificação por e-mail ou WhatsApp
const { enviarCodigoEmail } = require("../middlewares/auth2/email.js");
// Função para enviar código de verificação por WhatsApp
const { enviarCodigoZap } = require("../middlewares/auth2/zap.js");

const enviarCodigoVerificacao = async (req, res) => {
  const { destino, metodo } = req.body;

  try {
    // Busca o id do cliente ou parceiro pelo email informado
    let id_cliente = null;

    if (metodo === "email") {
      // Tenta buscar o cliente pelo email
      const [clientes] = await pool.query(
        "SELECT id FROM cliente WHERE email = ?",
        [destino]
      );
      if (clientes.length > 0) {
        id_cliente = clientes[0].id;
      } else {
        // Se não encontrar cliente, tenta buscar parceiro
        const [parceiros] = await pool.query(
          "SELECT id FROM parceiro_saas WHERE email = ?",
          [destino]
        );
        if (parceiros.length > 0) {
          id_cliente = parceiros[0].id;
        } else {
          return res
            .status(404)
            .json({ erro: "E-mail não encontrado para cliente ou parceiro." });
        }
      }
    } else if (metodo === "zap") {
      // Para WhatsApp, busca pelo telefone
      const [clientes] = await pool.query(
        "SELECT id FROM cliente WHERE telefone = ?",
        [destino]
      );
      if (clientes.length > 0) {
        id_cliente = clientes[0].id;
      } else {
        // Se não encontrar cliente, tenta buscar parceiro
        const [parceiros] = await pool.query(
          "SELECT id FROM parceiro_saas WHERE telefone = ?",
          [destino]
        );
        if (parceiros.length > 0) {
          id_cliente = parceiros[0].id;
        } else {
          return res.status(404).json({
            erro: "Telefone não encontrado para cliente ou parceiro.",
          });
        }
      }
    } else {
      return res.status(400).json({ erro: "Método inválido" });
    }

    // Verifica se já existe um código válido (não expirado) nos últimos 2 minutos
    const [codigosExistentes] = await pool.query(
      "SELECT * FROM codigos_verificacao WHERE id_cliente = ? AND expiracao > NOW() AND expiracao > DATE_SUB(NOW(), INTERVAL 2 MINUTE)",
      [id_cliente]
    );

    if (codigosExistentes.length > 0) {
      return res.status(429).json({
        erro: "Aguarde 2 minutos antes de solicitar um novo código.",
        tempoRestante: "2 minutos",
      });
    }

    // Gera um código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000);
    const expiracao = new Date(Date.now() + 5 * 60000); // 5 minutos

    // Salva o código no banco de dados
    await pool.query(
      "INSERT INTO codigos_verificacao (id_cliente, codigo, expiracao) VALUES (?, ?, ?)",
      [id_cliente, codigo, expiracao]
    );

    if (metodo === "email") {
      await enviarCodigoEmail(destino, codigo);
    } else if (metodo === "zap") {
      await enviarCodigoZap(destino, codigo);
      return res
        .status(501)
        .json({ erro: "Envio por WhatsApp não implementado." });
    } else {
      return res.status(400).json({ erro: "Método inválido" });
    }

    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao enviar código de verificação:", err);
    res.status(500).json({ erro: "Falha ao enviar código" });
  }
};
const verificarCodigo = async (req, res) => {
  const { destino, codigo } = req.body;

  try {
    // Busca o id do cliente ou parceiro pelo email informado
    let id_cliente = null;

    if (metodo === "email") {
      // Tenta buscar o cliente pelo email
      const [clientes] = await pool.query(
        "SELECT id FROM cliente WHERE email = ?",
        [destino]
      );
      if (clientes.length > 0) {
        id_cliente = clientes[0].id;
      } else {
        // Se não encontrar cliente, tenta buscar parceiro
        const [parceiros] = await pool.query(
          "SELECT id FROM parceiro_saas WHERE email = ?",
          [destino]
        );
        if (parceiros.length > 0) {
          id_cliente = parceiros[0].id;
        } else {
          return res
            .status(404)
            .json({ erro: "E-mail não encontrado para cliente ou parceiro." });
        }
      }
    } else if (metodo === "zap") {
      // Para WhatsApp, busca pelo telefone
      const [clientes] = await pool.query(
        "SELECT id FROM cliente WHERE telefone = ?",
        [destino]
      );
      if (clientes.length > 0) {
        id_cliente = clientes[0].id;
      } else {
        // Se não encontrar cliente, tenta buscar parceiro
        const [parceiros] = await pool.query(
          "SELECT id FROM parceiro_saas WHERE telefone = ?",
          [destino]
        );
        if (parceiros.length > 0) {
          id_cliente = parceiros[0].id;
        } else {
          return res.status(404).json({
            erro: "Telefone não encontrado para cliente ou parceiro.",
          });
        }
      }
    } else {
      return res.status(400).json({ erro: "Método inválido" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM codigos_verificacao WHERE id_cliente = ? AND codigo = ? AND expiracao > NOW()",
      [id_cliente, codigo]
    );

    if (rows.length > 0) {
      await pool.query("DELETE FROM codigos_verificacao WHERE id = ?", [
        rows[0].id,
      ]);
      return res.json({ sucesso: true });
    } else {
      return res
        .status(401)
        .json({ sucesso: false, erro: "Código inválido ou expirado" });
    }
  } catch (err) {
    console.error("Erro ao verificar código:", err);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro interno ao verificar código" });
  }
};

const verificarEmail = async (req, res) => {
  const { destino, codigo } = req.body;
  let id_cliente = null;
  let tipo_usuario = null;
  try {
    // Tenta buscar o cliente pelo email
    const [clientes] = await pool.query(
      "SELECT id FROM cliente WHERE email = ?",
      [destino]
    );
    if (clientes.length > 0) {
      id_cliente = clientes[0].id;
      verificado = clientes[0].email_verificado;
      if (verificado === 1) {
        return res.status(201).json({
          sucesso: true,
          mensagem: "E-mail já verificado.",
        });
      }
      tipo_usuario = "cliente";
    } else {
      // Se não encontrar cliente, tenta buscar parceiro
      const [parceiros] = await pool.query(
        "SELECT id FROM parceiro_saas WHERE email = ?",
        [destino]
      );
      if (parceiros.length > 0) {
        id_cliente = parceiros[0].id;
        tipo_usuario = "parceiro";
      } else {
        return res.status(404).json({
          sucesso: false,
          erro: "E-mail não encontrado para cliente ou parceiro.",
        });
      }
    }

    const [rows] = await pool.query(
      "SELECT * FROM codigos_verificacao WHERE id_cliente = ?",
      [id_cliente]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        erro: "Nenhum código de verificação encontrado para este usuário.",
      });
    }
    cbd = rows[0].codigo;
    console.log(cbd, "=", codigo);
    if (rows[0].codigo !== codigo) {
      return res
        .status(401)
        .json({ sucesso: false, erro: "Código inválido ou expirado" });
    }
    if (rows[0].expiracao < new Date()) {
      return res.status(401).json({ sucesso: false, erro: "Código expirado" });
    }

    if (cbd === codigo) {
      console.log("Código verificado com sucesso:", cbd);
      await pool.query("DELETE FROM codigos_verificacao WHERE id = ?", [
        rows[0].id,
      ]);
      if (tipo_usuario === "cliente") {
        await pool.query(
          "UPDATE cliente SET email_verificado = true WHERE id = ?",
          [id_cliente]
        );
        return res.status(201).json({
          sucesso: true,
          mensagem: "E-mail verificado com sucesso.",
        });
      } else if (tipo_usuario === "parceiro") {
        await pool.query(
          "UPDATE parceiro_saas SET email_verificado = true WHERE id = ?",
          [id_cliente]
        );
        return res.status(201).json({
          sucesso: true,
          mensagem: "E-mail verificado com sucesso.",
        });
      }
    } else {
      return res
        .status(401)
        .json({ sucesso: false, erro: "Código inválido ou expirado" });
    }
  } catch (err) {
    console.error("Erro ao verificar e-mail:", err);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro interno ao verificar e-mail" });
  }
};

// Login específico para PDV com geração de código de acesso
const loginPDV = async (req, res) => {
  try {
    console.log("🔐 Iniciando login PDV...");
    const { email, senha } = req.body;
    console.log("📧 Email recebido:", email);

    if (!email || !senha) {
      console.log("❌ Email ou senha não fornecidos");
      return res.status(400).json({
        success: false,
        message: "E-mail e senha são obrigatórios.",
      });
    }

    // Busca cliente pelo email
    console.log("🔍 Buscando cliente no banco...");
    const [clienteRows] = await pool.query(
      "SELECT * FROM cliente WHERE email = ?",
      [email]
    );
    console.log("📊 Clientes encontrados:", clienteRows.length);

    if (clienteRows.length === 0) {
      console.log("❌ Cliente não encontrado");
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    const cliente = clienteRows[0];
    console.log("✅ Cliente encontrado:", {
      id: cliente.id,
      email: cliente.email,
    });

    // Compara senha
    const senhaCorreta = await bcrypt.compare(senha, cliente.senha);
    console.log("🔐 Verificação de senha:", {
      senhaFornecida: senha ? "sim" : "não",
      senhaHash: cliente.senha ? "sim" : "não",
      senhaCorreta,
    });

    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    // Verifica se o e-mail está verificado
    console.log("🔍 Verificando status do email:", cliente.email_verificado);
    if (cliente.email_verificado === 0) {
      return res.status(403).json({
        success: false,
        message:
          "E-mail não verificado. Verifique seu e-mail antes de fazer login.",
      });
    }

    // Verifica se dupla autenticação está ativa
    if (cliente.dupla_autenticacao) {
      // Gera código e envia para o e-mail
      const codigo = Math.floor(100000 + Math.random() * 900000);
      const expiracao = new Date(Date.now() + 5 * 60000); // 5 minutos
      await pool.query(
        "INSERT INTO codigos_verificacao (id_cliente, codigo, expiracao) VALUES (?, ?, ?)",
        [cliente.id, codigo, expiracao]
      );
      try {
        await enviarCodigoEmail(cliente.email, codigo);
        return res.status(401).json({
          success: false,
          message: "Código de dupla autenticação enviado.",
          etapa: "dupla_autenticacao",
          id_cliente: cliente.id,
          email: cliente.email,
        });
      } catch (emailError) {
        console.error("Erro ao enviar email:", emailError);
        if (process.env.NODE_ENV === "development") {
          console.log("🔧 Modo desenvolvimento: Pulando dupla autenticação");
        } else {
          return res.status(500).json({
            success: false,
            message: "Erro ao enviar código de autenticação. Tente novamente.",
          });
        }
      }
    }

    // Gera código de acesso de 6 dígitos para PDV
    const codigoAcesso = Math.floor(100000 + Math.random() * 900000);
    const dataExpiracao = new Date(Date.now() + 30 * 60000); // 30 minutos

    // Salva o código de acesso no banco
    await pool.query(
      "INSERT INTO codigos_acesso (id_cliente, codigo, tipo_usuario, data_expiracao, ip_geracao, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
      [
        cliente.id,
        codigoAcesso,
        "cliente",
        dataExpiracao,
        req.ip || req.connection.remoteAddress,
        req.headers["user-agent"] || null,
      ]
    );

    // Gera token JWT
    const token = jwt.sign(
      {
        id: cliente.id,
        email: cliente.email,
        nome: cliente.nome_representante,
        tipo: "cliente",
        acesso: "pdv",
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Atualiza último login
    await pool.query("UPDATE cliente SET ultimo_login = NOW() WHERE id = ?", [
      cliente.id,
    ]);

    // Retorna dados do cliente e código de acesso para PDV
    return res.json({
      success: true,
      message: "Login PDV realizado com sucesso!",
      token,
      codigo_acesso: codigoAcesso,
      user: {
        id: cliente.id,
        razao_social: cliente.razao_social,
        cnpj: cliente.cnpj,
        nome_representante: cliente.nome_representante,
        cpf: cliente.cpf,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep,
        pais: cliente.pais,
        ativo: cliente.ativo,
      },
    });
  } catch (err) {
    console.error("Erro no login PDV:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao fazer login PDV.",
    });
  }
};

// Função para verificar código de acesso
const verificarCodigoAcesso = async (req, res) => {
  try {
    const { codigo, id_cliente } = req.body;

    if (!codigo || !id_cliente) {
      return res.status(400).json({
        success: false,
        message: "Código e ID do cliente são obrigatórios.",
      });
    }

    // Busca o código de acesso no banco
    const [codigos] = await pool.query(
      "SELECT * FROM codigos_acesso WHERE id_cliente = ? AND codigo = ? AND data_expiracao > NOW() AND usado = false",
      [id_cliente, codigo]
    );

    if (codigos.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Código de acesso inválido, expirado ou já utilizado.",
      });
    }

    const codigoAcesso = codigos[0];

    // Marca o código como usado
    await pool.query(
      "UPDATE codigos_acesso SET usado = true, data_uso = NOW() WHERE id = ?",
      [codigoAcesso.id]
    );

    // Busca dados do cliente
    const [clientes] = await pool.query("SELECT * FROM cliente WHERE id = ?", [
      id_cliente,
    ]);

    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente não encontrado.",
      });
    }

    const cliente = clientes[0];

    // Gera novo token JWT
    const token = jwt.sign(
      {
        id: cliente.id,
        email: cliente.email,
        nome: cliente.nome_representante,
        tipo: "cliente",
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      success: true,
      message: "Código de acesso verificado com sucesso!",
      token,
      user: {
        id: cliente.id,
        razao_social: cliente.razao_social,
        cnpj: cliente.cnpj,
        nome_representante: cliente.nome_representante,
        cpf: cliente.cpf,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep,
        pais: cliente.pais,
        ativo: cliente.ativo,
      },
    });
  } catch (err) {
    console.error("Erro ao verificar código de acesso:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao verificar código de acesso.",
    });
  }
};

// Função para limpar tokens expirados
const limparTokensExpirados = async () => {
  try {
    const [resultado] = await pool.query(
      "DELETE FROM codigos_acesso WHERE data_expiracao < NOW()"
    );

    if (resultado.affectedRows > 0) {
      console.log(`🧹 ${resultado.affectedRows} tokens expirados removidos`);
    }

    return resultado.affectedRows;
  } catch (err) {
    console.error("Erro ao limpar tokens expirados:", err);
    return 0;
  }
};

// Função para verificar token de acesso (usado por outros backends)
const verificarTokenAcesso = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token é obrigatório.",
      });
    }

    // Limpa tokens expirados antes de verificar
    await limparTokensExpirados();

    // Busca o código de acesso no banco pelo token
    const [codigos] = await pool.query(
      "SELECT ca.*, c.* FROM codigos_acesso ca JOIN cliente c ON ca.id_cliente = c.id WHERE ca.codigo = ? AND ca.data_expiracao > NOW() AND ca.usado = false",
      [token]
    );

    if (codigos.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Token de acesso inválido, expirado ou já utilizado.",
      });
    }

    const codigoAcesso = codigos[0];

    // Marca o código como usado
    await pool.query(
      "UPDATE codigos_acesso SET usado = true, data_uso = NOW() WHERE id = ?",
      [codigoAcesso.id]
    );

    // Gera novo token JWT
    const newToken = jwt.sign(
      {
        id: codigoAcesso.id,
        email: codigoAcesso.email,
        nome: codigoAcesso.nome_representante,
        tipo: "cliente",
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      success: true,
      message: "Token de acesso verificado com sucesso!",
      token: newToken,
      user: {
        id: codigoAcesso.id,
        razao_social: codigoAcesso.razao_social,
        cnpj: codigoAcesso.cnpj,
        nome_representante: codigoAcesso.nome_representante,
        cpf: codigoAcesso.cpf,
        email: codigoAcesso.email,
        telefone: codigoAcesso.telefone,
        endereco: codigoAcesso.endereco,
        cidade: codigoAcesso.cidade,
        estado: codigoAcesso.estado,
        cep: codigoAcesso.cep,
        pais: codigoAcesso.pais,
        ativo: codigoAcesso.ativo,
      },
    });
  } catch (err) {
    console.error("Erro ao verificar token de acesso:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao verificar token de acesso.",
    });
  }
};

// Rota para limpeza manual de tokens expirados
const limparTokensExpiradosRoute = async (req, res) => {
  try {
    const tokensRemovidos = await limparTokensExpirados();

    return res.json({
      success: true,
      message: `${tokensRemovidos} tokens expirados foram removidos`,
      tokensRemovidos,
    });
  } catch (err) {
    console.error("Erro na limpeza manual de tokens:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao limpar tokens expirados.",
    });
  }
};

const me = async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "Token não fornecido" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    // Exemplo: supondo que o payload tem um campo 'perfil' ou 'tipo'
    let user = null;
    user = decoded;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });
    }

    // Retorne apenas os dados necessários
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
};

module.exports = {
  registerCliente,
  loginCliente,
  loginPDV,
  getProfile,
  updateProfile,
  enviarCodigoVerificacao,
  verificarCodigo,
  verificarEmail,
  verificarCodigoAcesso,
  verificarTokenAcesso,
  limparTokensExpiradosRoute,
  limparTokensExpirados,
  me,
};
