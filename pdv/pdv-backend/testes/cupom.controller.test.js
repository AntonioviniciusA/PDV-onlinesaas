const request = require("supertest");
const { pool } = require("../config/database");
let app;

beforeAll(async () => {
  app = require("../server");
});

afterAll(async () => {
  await pool.end();
});

describe("Cupom Controller", () => {
  it("deve imprimir cupom offline (mock)", async () => {
    const res = await request(app)
      .post("/local/cupom/imprimir-offline")
      .send({
        numero: 123,
        user: { name: "Teste" },
        timestamp: new Date(),
        total: 10.0,
        discount: 0,
        paymentMethod: "dinheiro",
        receivedAmount: 10.0,
        changeAmount: 0,
        items: [{ name: "Produto 1", quantity: 1, totalPrice: 10.0 }],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("deve imprimir recibo offline (mock)", async () => {
    const res = await request(app)
      .post("/local/cupom/imprimir-recibo-offline")
      .send({
        numero: 456,
        cliente: "Cliente Teste",
        timestamp: new Date(),
        total: 20.0,
        items: [
          { descricao: "Serviço 1", quantidade: 1, valor_unitario: 20.0 },
        ],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
