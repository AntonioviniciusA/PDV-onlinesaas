const { pool } = require("../config/database.js");
const bcrypt = require("bcryptjs");

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
          id_loja, numero_caixa, link_api_cupom, timezone, bd_backup, bd_central, 
          url_servidor_central, sincronizacao_automatico, intervalo_sincronizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id_loja,
          1, // numero_caixa padrão
          "http://localhost:3000/api/cupom",
          "America/Sao_Paulo",
          false,
          false,
          "",
          false,
          10,
        ]
      );

      return res.status(200).json({
        sucesso: true,
        mensagem: "Configurações criadas com sucesso",
        configuracoes: {
          id: result.insertId,
          id_loja: req.user.id_loja,
          numero_caixa: 1,
          link_api_cupom: "http://localhost:3000/api/cupom",
          timezone: "America/Sao_Paulo",
          bd_backup: false,
          bd_central: false,
          url_servidor_central: "",
          sincronizacao_automatico: false,
          intervalo_sincronizacao: 10,
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
    const {
      numero_caixa,
      link_api_cupom,
      timezone,
      bd_backup,
      bd_central,
      url_servidor_central,
      sincronizacao_automatico,
      intervalo_sincronizacao,
    } = req.body;

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
          id_loja, numero_caixa, link_api_cupom, timezone, bd_backup, bd_central, 
          url_servidor_central, sincronizacao_automatico, intervalo_sincronizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id_loja,
          numero_caixa || 1,
          link_api_cupom || "http://localhost:3000/api/cupom",
          timezone || "America/Sao_Paulo",
          bd_backup || false,
          bd_central || false,
          url_servidor_central || "",
          sincronizacao_automatico || false,
          intervalo_sincronizacao || 10,
        ]
      );

      return res.status(201).json({
        sucesso: true,
        mensagem: "Configurações criadas com sucesso",
        configuracoes: {
          id: result.insertId,
          id_loja: req.user.id_loja,
          numero_caixa: numero_caixa || 1,
          link_api_cupom: link_api_cupom || "http://localhost:3000/api/cupom",
          timezone: timezone || "America/Sao_Paulo",
          bd_backup: bd_backup || false,
          bd_central: bd_central || false,
          url_servidor_central: url_servidor_central || "",
          sincronizacao_automatico: sincronizacao_automatico || false,
          intervalo_sincronizacao: intervalo_sincronizacao || 10,
          atualizado_em: new Date(),
        },
      });
    } else {
      // Atualizar configuração existente
      const [result] = await connection.query(
        `UPDATE configuracoes_sistema SET 
          numero_caixa = ?,
          link_api_cupom = ?, 
          timezone = ?,
          bd_backup = ?,
          bd_central = ?,
          url_servidor_central = ?,
          sincronizacao_automatico = ?,
          intervalo_sincronizacao = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id_loja = ?`,
        [
          numero_caixa || 1,
          link_api_cupom || "http://localhost:3000/api/cupom",
          timezone || "America/Sao_Paulo",
          bd_backup || false,
          bd_central || false,
          url_servidor_central || "",
          sincronizacao_automatico || false,
          intervalo_sincronizacao || 10,
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

/**
 * Buscar permissões disponíveis no sistema
 */
const getPermissoes = async (req, res) => {
  try {
    const permissoes = [
      {
        categoria: "PDV",
        permissoes: [
          { value: "pdv.operate", label: "Operar PDV" },
          { value: "pdv.authorize", label: "Autorizar operações" },
          { value: "pdv.products", label: "Gerenciar produtos" },
          { value: "pdv.reports", label: "Visualizar relatórios" },
          { value: "pdv.cash", label: "Gerenciar caixa" },
          { value: "pdv.labels", label: "Gerenciar etiquetas" },
        ],
      },
      {
        categoria: "Produtos",
        permissoes: [
          { value: "products.view", label: "Visualizar produtos" },
          { value: "products.manage", label: "Gerenciar produtos" },
          { value: "products.create", label: "Criar produtos" },
          { value: "products.edit", label: "Editar produtos" },
          { value: "products.delete", label: "Excluir produtos" },
        ],
      },
      {
        categoria: "Relatórios",
        permissoes: [
          { value: "reports.view", label: "Visualizar relatórios" },
          { value: "reports.manage", label: "Gerenciar relatórios" },
          { value: "reports.export", label: "Exportar relatórios" },
        ],
      },
      {
        categoria: "Caixa",
        permissoes: [
          { value: "cash.manage", label: "Gerenciar caixa" },
          { value: "cash.open", label: "Abrir caixa" },
          { value: "cash.close", label: "Fechar caixa" },
          { value: "cash.view", label: "Visualizar caixa" },
        ],
      },
      {
        categoria: "Etiquetas",
        permissoes: [
          { value: "labels.config", label: "Configurar etiquetas" },
          { value: "labels.print", label: "Imprimir etiquetas" },
          { value: "labels.manage", label: "Gerenciar etiquetas" },
        ],
      },
      {
        categoria: "Sistema",
        permissoes: [
          { value: "manage.users", label: "Gerenciar usuários" },
          { value: "system.config", label: "Configurar sistema" },
          { value: "system.backup", label: "Backup do sistema" },
        ],
      },
      {
        categoria: "Administração",
        permissoes: [{ value: "*", label: "Acesso total (Administrador)" }],
      },
    ];

    return res.status(200).json({
      sucesso: true,
      mensagem: "Permissões carregadas com sucesso",
      permissoes,
    });
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar permissões",
      erro: error.message,
    });
  }
};

/**
 * Gerenciamento de usuários
 */

// Verificar permissão para gerenciar usuários
const checkManageUsersPermission = (user) => {
  let permissions = user.permissions;
  if (typeof permissions === "string") {
    try {
      permissions = JSON.parse(permissions);
    } catch (e) {
      permissions = [];
    }
  }

  return (
    user.perfil === "admin" ||
    permissions.includes("manage.users") ||
    permissions.includes("*")
  );
};

// Listar usuários
const getUsuarios = async (req, res) => {
  let connection;
  try {
    if (!req.user || !req.user.id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não autenticado ou sem loja",
      });
    }

    if (!checkManageUsersPermission(req.user)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Você não tem permissão para gerenciar usuários",
      });
    }

    connection = await pool.getConnection();

    const [usuarios] = await connection.query(
      "SELECT id, nome, email, perfil, permissions, ativo, criado_em FROM users WHERE id_loja = ? ORDER BY nome",
      [req.user.id_loja]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Usuários encontrados",
      usuarios: usuarios,
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar usuários",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

// Criar usuário
const createUsuario = async (req, res) => {
  let connection;
  try {
    const { nome, email, senha, perfil, permissions, ativo } = req.body;

    if (!req.user || !req.user.id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não autenticado ou sem loja",
      });
    }

    if (!checkManageUsersPermission(req.user)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Você não tem permissão para gerenciar usuários",
      });
    }

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Todos os campos obrigatórios devem ser preenchidos",
      });
    }

    connection = await pool.getConnection();

    // Verificar se email já existe
    const [existentes] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND id_loja = ?",
      [email, req.user.id_loja]
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Email já cadastrado",
      });
    }

    // Definir permissões baseadas no perfil se não fornecidas
    let userPermissions = permissions || [];
    if (!permissions || permissions.length === 0) {
      switch (perfil) {
        case "admin":
          userPermissions = ["*"];
          break;
        case "gerente":
          userPermissions = [
            "pdv.operate",
            "pdv.authorize",
            "pdv.products",
            "pdv.reports",
            "pdv.cash",
            "pdv.labels",
            "manage.users",
          ];
          break;
        case "operador":
          userPermissions = ["pdv.operate", "pdv.products"];
          break;
        case "fiscal":
          userPermissions = ["pdv.operate", "pdv.authorize", "reports.view"];
          break;
        default:
          userPermissions = ["pdv.operate"];
      }
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const [result] = await connection.query(
      `INSERT INTO users (
        id_loja, nome, email, senha, perfil, permissions, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id_loja,
        nome,
        email,
        senhaHash,
        perfil,
        JSON.stringify(userPermissions),
        ativo ? 1 : 0,
      ]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Usuário criado com sucesso",
      usuario: {
        id: result.insertId,
        nome,
        email,
        perfil,
        permissions: userPermissions,
        ativo,
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar usuário",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

// Atualizar usuário
const updateUsuario = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { nome, email, senha, perfil, permissions, ativo } = req.body;

    if (!req.user || !req.user.id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não autenticado ou sem loja",
      });
    }

    if (!checkManageUsersPermission(req.user)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Você não tem permissão para gerenciar usuários",
      });
    }

    if (!nome || !email || !perfil) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nome, email e perfil são obrigatórios",
      });
    }

    connection = await pool.getConnection();

    // Verificar se usuário existe e pertence à loja
    const [usuarios] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND id_loja = ?",
      [id, req.user.id_loja]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Usuário não encontrado",
      });
    }

    // Verificar se email já existe (exceto para o usuário atual)
    const [existentes] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND id_loja = ? AND id != ?",
      [email, req.user.id_loja, id]
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Email já cadastrado",
      });
    }

    // Definir permissões baseadas no perfil se não fornecidas
    let userPermissions = permissions || [];
    if (!permissions || permissions.length === 0) {
      switch (perfil) {
        case "admin":
          userPermissions = ["*"];
          break;
        case "gerente":
          userPermissions = [
            "pdv.operate",
            "pdv.authorize",
            "pdv.products",
            "pdv.reports",
            "pdv.cash",
            "pdv.labels",
            "manage.users",
          ];
          break;
        case "operador":
          userPermissions = ["pdv.operate", "pdv.products"];
          break;
        case "fiscal":
          userPermissions = ["pdv.operate", "pdv.authorize", "reports.view"];
          break;
        default:
          userPermissions = ["pdv.operate"];
      }
    }

    // Preparar query de atualização
    let updateQuery = `
      UPDATE users SET 
        nome = ?, 
        email = ?, 
        perfil = ?, 
        permissions = ?, 
        ativo = ?
    `;
    let updateValues = [
      nome,
      email,
      perfil,
      JSON.stringify(userPermissions),
      ativo ? 1 : 0,
    ];

    // Se senha foi fornecida, incluir na atualização
    if (senha && senha.trim() !== "") {
      const senhaHash = await bcrypt.hash(senha, 10);
      updateQuery += ", senha = ?";
      updateValues.push(senhaHash);
    }

    updateQuery += " WHERE id = ? AND id_loja = ?";
    updateValues.push(id, req.user.id_loja);

    const [result] = await connection.query(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Usuário não encontrado",
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Usuário atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar usuário",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

// Excluir usuário
const deleteUsuario = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não autenticado ou sem loja",
      });
    }

    if (!checkManageUsersPermission(req.user)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Você não tem permissão para gerenciar usuários",
      });
    }

    // Não permitir excluir o próprio usuário
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Não é possível excluir o próprio usuário",
      });
    }

    connection = await pool.getConnection();

    // Verificar se usuário existe e pertence à loja
    const [usuarios] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND id_loja = ?",
      [id, req.user.id_loja]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Usuário não encontrado",
      });
    }

    const [result] = await connection.query(
      "DELETE FROM users WHERE id = ? AND id_loja = ?",
      [id, req.user.id_loja]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Usuário não encontrado",
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Usuário excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao excluir usuário",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

// Funções para gerenciar token de acesso
const salvarToken = async (req, res) => {
  let connection;
  try {
    const { token_acesso, token_expiracao } = req.body;

    if (!req.user || !req.user.id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não autenticado ou sem loja",
      });
    }

    connection = await pool.getConnection();

    // Atualizar ou inserir token nas configurações
    const [result] = await connection.query(
      `UPDATE configuracoes_sistema 
       SET token_acesso = ?, token_expiracao = ?, atualizado_em = NOW()
       WHERE id_loja = ?`,
      [token_acesso, token_expiracao, req.user.id_loja]
    );

    if (result.affectedRows === 0) {
      // Se não existe configuração, criar uma
      await connection.query(
        `INSERT INTO configuracoes_sistema 
         (id_loja, token_acesso, token_expiracao, numero_caixa, link_api_cupom, timezone)
         VALUES (?, ?, ?, 1, 'http://localhost:3000/api/cupom', 'America/Sao_Paulo')`,
        [req.user.id_loja, token_acesso, token_expiracao]
      );
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Token salvo com sucesso",
    });
  } catch (error) {
    console.error("Erro ao salvar token:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao salvar token",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const buscarToken = async (req, res) => {
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
      "SELECT token_acesso, token_expiracao FROM configuracoes_sistema WHERE id_loja = ?",
      [req.user.id_loja]
    );

    if (configuracoes.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Token não encontrado",
      });
    }

    return res.status(200).json({
      sucesso: true,
      token: configuracoes[0].token_acesso,
      expiracao: configuracoes[0].token_expiracao,
    });
  } catch (error) {
    console.error("Erro ao buscar token:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar token",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const verificarTokenValido = async (req, res) => {
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
      "SELECT token_acesso, token_expiracao FROM configuracoes_sistema WHERE id_loja = ?",
      [req.user.id_loja]
    );

    if (configuracoes.length === 0) {
      return res.status(200).json({
        sucesso: true,
        valido: false,
        mensagem: "Token não encontrado",
      });
    }

    const { token_acesso, token_expiracao } = configuracoes[0];

    if (!token_acesso) {
      return res.status(200).json({
        sucesso: true,
        valido: false,
        mensagem: "Token não configurado",
      });
    }

    // Verificar se o token expirou
    if (token_expiracao && new Date() > new Date(token_expiracao)) {
      return res.status(200).json({
        sucesso: true,
        valido: false,
        mensagem: "Token expirado",
      });
    }

    return res.status(200).json({
      sucesso: true,
      valido: true,
      token: token_acesso,
      expiracao: token_expiracao,
    });
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao verificar token",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const limparToken = async (req, res) => {
  let connection;
  try {
    if (!req.user || !req.user.id_loja) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário não autenticado ou sem loja",
      });
    }

    connection = await pool.getConnection();

    const [result] = await connection.query(
      `UPDATE configuracoes_sistema 
       SET token_acesso = NULL, token_expiracao = NULL, atualizado_em = NOW()
       WHERE id_loja = ?`,
      [req.user.id_loja]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Token removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao limpar token:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao limpar token",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getConfiguracoes,
  updateConfiguracoes,
  getTimezones,
  getPermissoes,
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  salvarToken,
  buscarToken,
  verificarTokenValido,
  limparToken,
};
