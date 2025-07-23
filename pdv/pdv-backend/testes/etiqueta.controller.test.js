const request = require("supertest");
const { pool } = require("../config/database");
let app;
let configId;
const TEST_USER = {
  id_loja: "00000000-0000-0000-0000-000000000000",
};

beforeAll(async () => {
  const connection = await pool.getConnection();
  await connection.query("DELETE FROM etiqueta_configuracoes");
  connection.release();
  app = require("../server");
});

afterAll(async () => {
  const connection = await pool.getConnection();
  await connection.query("DELETE FROM etiqueta_configuracoes");
  connection.release();
  await pool.end();
});

describe("Etiqueta Controller", () => {
  it("deve criar configuração de etiqueta", async () => {
    const res = await request(app).post("/local/etiqueta/config").send({
      nome: "Etiqueta Teste",
      largura: 100,
      altura: 50,
      mostrar_comparacao: true,
      mostrar_icms: true,
      mostrar_codigo_de_barra: true,
      fonte_nome: 12,
      fonte_preco: 18,
      fonte_comparacao: 10,
      fonte_codigo_de_barra: 8,
      cor_fundo: "#ffffff",
      cor_texto: "#000000",
      cor_preco: "#16a34a",
      cor_comparacao: "#2563eb",
      id_loja: TEST_USER.id_loja,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    configId = res.body.id;
  });

  it("deve listar templates de etiqueta", async () => {
    const res = await request(app).get(
      `/local/etiqueta/templates?id_loja=${TEST_USER.id_loja}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.templates.length).toBeGreaterThan(0);
  });

  it("deve atualizar configuração de etiqueta", async () => {
    const res = await request(app)
      .put(`/local/etiqueta/config/${configId}`)
      .send({
        nome: "Etiqueta Teste Atualizada",
        largura: 120,
        altura: 60,
        mostrar_comparacao: false,
        mostrar_icms: false,
        mostrar_codigo_de_barra: false,
        fonte_nome: 14,
        fonte_preco: 20,
        fonte_comparacao: 12,
        fonte_codigo_de_barra: 10,
        cor_fundo: "#f8fafc",
        cor_texto: "#1e293b",
        cor_preco: "#059669",
        cor_comparacao: "#1d4ed8",
        id_loja: TEST_USER.id_loja,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
