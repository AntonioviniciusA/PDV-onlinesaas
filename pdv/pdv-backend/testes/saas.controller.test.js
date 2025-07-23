const request = require("supertest");
const { pool } = require("../config/database");
let app;

beforeAll(async () => {
  app = require("../server");
});

afterAll(async () => {
  await pool.end();
});

describe("SaaS Controller", () => {
  it("deve retornar erro para login SaaS inválido", async () => {
    const res = await request(app)
      .post("/local/saas/login")
      .send({ email: "invalido@teste.com", senha: "errada" });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  // Para testar login SaaS real, seria necessário mockar a resposta do SaaS central
  // Aqui apenas testa se a rota existe e responde
  it("deve retornar erro de autenticação em /me se não autenticado", async () => {
    const res = await request(app).get("/local/saas/me");
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
