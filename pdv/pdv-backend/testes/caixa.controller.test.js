const request = require("supertest");
const { pool } = require("../config/database");
let app;
let userId;

const TEST_USER = {
  id_loja: "00000000-0000-0000-0000-000000000000",
  nome: "Fiscal Teste",
  email: "fiscal@teste.com",
  senha: "$2a$10$yjkeg.NF9hK0sxQ/P5CLo.LdhE9B3U1fwXTOLYlB7VrKgN/lccgvi", // admin123
  perfil: "operador",
  permissions: '["pdv.operate","pdv.authorize"]',
  ativo: 1,
};

beforeAll(async () => {
  const connection = await pool.getConnection();
  await connection.query("DELETE FROM users");
  await connection.query("DELETE FROM caixas");
  await connection.query("DELETE FROM autorizadores");
  await connection.query(
    `INSERT INTO users (id_loja, nome, email, senha, perfil, permissions, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      TEST_USER.id_loja,
      TEST_USER.nome,
      TEST_USER.email,
      TEST_USER.senha,
      TEST_USER.perfil,
      TEST_USER.permissions,
      TEST_USER.ativo,
    ]
  );
  // Buscar o id real do usuário
  const [rows] = await connection.query(
    "SELECT id FROM users WHERE email = ?",
    [TEST_USER.email]
  );
  userId = rows[0].id;
  connection.release();
  app = require("../server");
});

afterAll(async () => {
  const connection = await pool.getConnection();
  await connection.query("DELETE FROM caixas");
  await connection.query("DELETE FROM autorizadores");
  await connection.query("DELETE FROM users");
  connection.release();
  await pool.end();
});

describe("Caixa Controller", () => {
  let cookie;
  let caixaId;

  it("deve autorizar caixa com fiscal", async () => {
    // Autorizar caixa (senha: admin123)
    const res = await request(app)
      .post("/local/caixa/autorizar")
      .send({ entrada: `${userId}.admin123` });
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
    expect(res.body.usuario.autorizador).toBeDefined();
  });

  it("deve abrir caixa", async () => {
    // Login para obter cookie
    const login = await request(app)
      .post("/local/auth/login")
      .send({ entrada: `${userId}.admin123` });
    cookie = login.headers["set-cookie"];
    // Autorizar caixa
    const autorizacao = await request(app)
      .post("/local/caixa/autorizar")
      .send({ entrada: `${userId}.admin123` });
    const autorizador = autorizacao.body.usuario.autorizador;
    // Abrir caixa
    const res = await request(app)
      .post("/local/caixa/abrir")
      .set("Cookie", cookie)
      .send({
        amount: 100,
        usuario: {
          id_loja: TEST_USER.id_loja,
          id: userId,
          autorizador,
        },
        caixa_numero: 99,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
    caixaId = res.body.caixa.id;
  });

  it("deve fechar caixa", async () => {
    const res = await request(app)
      .post("/local/caixa/fechar")
      .set("Cookie", cookie)
      .send({
        id_caixa: caixaId,
        id_loja: TEST_USER.id_loja,
        amount: 100,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
    expect(res.body.status).toBe("fechado");
  });
});
