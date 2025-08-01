const request = require("supertest");
const app = require("../server");
const { pool } = require("../config/database");

describe("Configurações Sistema Controller", () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Login para obter token de autenticação
    const loginResponse = await request(app).post("/auth/login").send({
      email: "admin@dominio.com",
      senha: "admin123",
    });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (testUserId) {
      await pool.query("DELETE FROM users WHERE id = ?", [testUserId]);
    }
    await pool.end();
  });

  describe("GET /configuracoes_sistema/", () => {
    it("deve retornar configurações do sistema", async () => {
      const response = await request(app)
        .get("/configuracoes_sistema/")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.configuracoes).toBeDefined();
    });
  });

  describe("GET /configuracoes_sistema/timezones", () => {
    it("deve retornar lista de timezones", async () => {
      const response = await request(app)
        .get("/configuracoes_sistema/timezones")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.timezones).toBeDefined();
      expect(Array.isArray(response.body.timezones)).toBe(true);
    });
  });

  describe("GET /configuracoes_sistema/permissoes", () => {
    it("deve retornar lista de permissões disponíveis", async () => {
      const response = await request(app)
        .get("/configuracoes_sistema/permissoes")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.permissoes).toBeDefined();
      expect(Array.isArray(response.body.permissoes)).toBe(true);
    });
  });

  describe("GET /configuracoes_sistema/usuarios", () => {
    it("deve retornar lista de usuários", async () => {
      const response = await request(app)
        .get("/configuracoes_sistema/usuarios")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.usuarios).toBeDefined();
      expect(Array.isArray(response.body.usuarios)).toBe(true);
    });
  });

  describe("POST /configuracoes_sistema/usuarios", () => {
    it("deve criar um novo usuário com permissões personalizadas", async () => {
      const novoUsuario = {
        nome: "Teste Usuário",
        email: "teste@exemplo.com",
        senha: "senha123",
        perfil: "operador",
        permissions: ["pdv.operate", "pdv.products"],
        ativo: true,
      };

      const response = await request(app)
        .post("/configuracoes_sistema/usuarios")
        .set("Authorization", `Bearer ${authToken}`)
        .send(novoUsuario);

      expect(response.status).toBe(201);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.usuario).toBeDefined();
      expect(response.body.usuario.nome).toBe(novoUsuario.nome);
      expect(response.body.usuario.email).toBe(novoUsuario.email);
      expect(response.body.usuario.permissions).toEqual(
        novoUsuario.permissions
      );

      testUserId = response.body.usuario.id;
    });

    it("deve criar usuário com permissões padrão quando não especificadas", async () => {
      const novoUsuario = {
        nome: "Teste Usuário 2",
        email: "teste2@exemplo.com",
        senha: "senha123",
        perfil: "gerente",
        ativo: true,
      };

      const response = await request(app)
        .post("/configuracoes_sistema/usuarios")
        .set("Authorization", `Bearer ${authToken}`)
        .send(novoUsuario);

      expect(response.status).toBe(201);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.usuario.permissions).toContain("pdv.operate");
      expect(response.body.usuario.permissions).toContain("manage.users");
    });
  });

  describe("PUT /configuracoes_sistema/usuarios/:id", () => {
    it("deve atualizar usuário com novas permissões", async () => {
      if (!testUserId) {
        // Criar usuário de teste se não existir
        const novoUsuario = {
          nome: "Teste Atualização",
          email: "teste.atualizacao@exemplo.com",
          senha: "senha123",
          perfil: "operador",
          permissions: ["pdv.operate"],
          ativo: true,
        };

        const createResponse = await request(app)
          .post("/configuracoes_sistema/usuarios")
          .set("Authorization", `Bearer ${authToken}`)
          .send(novoUsuario);

        testUserId = createResponse.body.usuario.id;
      }

      const atualizacao = {
        nome: "Teste Atualizado",
        email: "teste.atualizado@exemplo.com",
        perfil: "gerente",
        permissions: ["pdv.operate", "pdv.authorize", "manage.users"],
        ativo: true,
      };

      const response = await request(app)
        .put(`/configuracoes_sistema/usuarios/${testUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(atualizacao);

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
    });
  });
});
