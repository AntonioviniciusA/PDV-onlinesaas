const request = require("supertest");
const { pool } = require("../config/database");
let app;
let userId;

beforeAll(async () => {
  const connection = await pool.getConnection();
  await connection.query("DELETE FROM users");
  await connection.query(
    `INSERT INTO users (id_loja, nome, email, senha, perfil, permissions, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      "00000000-0000-0000-0000-000000000000",
      "Administrador",
      "admin@dominio.com",
      "$2a$10$yjkeg.NF9hK0sxQ/P5CLo.LdhE9B3U1fwXTOLYlB7VrKgN/lccgvi", // senha: admin123
      "admin",
      '["pdv.operate","pdv.authorize"]',
      1,
    ]
  );
  // Buscar o id real do usuário
  const [rows] = await connection.query(
    "SELECT id FROM users WHERE email = ?",
    ["admin@dominio.com"]
  );
  userId = rows[0].id;
  connection.release();
  app = require("../server");
});

afterAll(async () => {
  const connection = await pool.getConnection();
  await connection.query("DELETE FROM users");
  connection.release();
  await pool.end();
});

describe("Auth Controller", () => {
  it("deve retornar erro para login inválido", async () => {
    const res = await request(app)
      .post("/local/auth/login")
      .send({ entrada: "usuarioinvalido.senhaerrada" });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("deve logar com usuário válido", async () => {
    const res = await request(app)
      .post("/local/auth/login")
      .send({ entrada: `${userId}.admin123` });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("deve retornar usuário autenticado em /me", async () => {
    const login = await request(app)
      .post("/local/auth/login")
      .send({ entrada: `${userId}.admin123` });
    const cookie = login.headers["set-cookie"];
    const res = await request(app).get("/local/auth/me").set("Cookie", cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.nome).toBe("Administrador");
  });
});
