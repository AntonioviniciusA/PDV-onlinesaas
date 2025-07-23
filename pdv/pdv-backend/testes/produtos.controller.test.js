const request = require("supertest");
const { pool } = require("../config/database");
let app;
let userId;
let produtoId;
const TEST_USER = {
  id_loja: "00000000-0000-0000-0000-000000000000",
  nome: "Prod Teste",
  email: "prod@teste.com",
  senha: "$2a$10$yjkeg.NF9hK0sxQ/P5CLo.LdhE9B3U1fwXTOLYlB7VrKgN/lccgvi", // admin123
  perfil: "admin",
  permissions: '["products.manage"]',
  ativo: 1,
};

beforeAll(async () => {
  const connection = await pool.getConnection();
  await connection.query("DELETE FROM users");
  await connection.query("DELETE FROM produto");
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
  await connection.query("DELETE FROM produto");
  await connection.query("DELETE FROM users");
  connection.release();
  await pool.end();
});

describe("Produtos Controller", () => {
  it("deve criar produto", async () => {
    const res = await request(app).post("/local/produtos").send({
      id_loja: TEST_USER.id_loja,
      codigo: "P001",
      codigo_barras: "1234567890123",
      descricao: "Produto Teste",
      grupo: "Teste",
      ncm: "1234.56.78",
      preco_custo: 10.0,
      margem_lucro: 20.0,
      preco_venda: 12.0,
      estoque_minimo: 1,
      estoque_maximo: 10,
      estoque_atual: 5,
      unidade: "UN",
      controla_estoque: true,
      cfop: "5102",
      csosn: "102",
      cst: "00",
      icms: 18.0,
      ativo: true,
      exibir_tela: true,
      solicita_quantidade: false,
      permitir_combinacao: false,
      cest: "123",
      cst_pis: "01",
      pis: 1.65,
      cst_cofins: "01",
      cofins: 7.6,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.sucesso).toBe(true);
    produtoId = res.body.id;
  });

  it("deve listar produtos", async () => {
    const res = await request(app).get(
      `/local/produtos?id_loja=${TEST_USER.id_loja}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
    expect(res.body.produtos.length).toBeGreaterThan(0);
  });

  it("deve atualizar produto", async () => {
    const res = await request(app).put(`/local/produtos/${produtoId}`).send({
      codigo: "P001",
      codigo_barras: "1234567890123",
      descricao: "Produto Teste Atualizado",
      grupo: "Teste",
      ncm: "1234.56.78",
      preco_custo: 10.0,
      margem_lucro: 20.0,
      preco_venda: 15.0,
      estoque_minimo: 1,
      estoque_maximo: 10,
      estoque_atual: 7,
      unidade: "UN",
      controla_estoque: true,
      cfop: "5102",
      csosn: "102",
      cst: "00",
      icms: 18.0,
      ativo: true,
      exibir_tela: true,
      solicita_quantidade: false,
      permitir_combinacao: false,
      cest: "123",
      cst_pis: "01",
      pis: 1.65,
      cst_cofins: "01",
      cofins: 7.6,
      id_loja: TEST_USER.id_loja,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });

  it("deve apagar produto", async () => {
    const res = await request(app).delete(
      `/local/produtos/${produtoId}?id_loja=${TEST_USER.id_loja}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });
});
