const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { entrada } = req.body;
    console.log("entrada", entrada);
    if (!entrada || !entrada.includes(".")) {
      return res.status(400).json({
        success: false,
        message: "Formato inválido: esperado 'id.senha'",
      });
    }

    const [id, senha] = entrada.split(".");
    // console.log("id extraído:", id);
    // console.log("senha extraída:", senha);
    // console.log("comprimento da senha:", senha.length);
    // console.log("senha com trim:", senha.trim());
    // console.log("senha com trim length:", senha.trim().length);

    const [usersRows] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    console.log("usersRows", usersRows);

    if (usersRows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não encontrado." });
    }

    const senhaValida = await bcrypt.compare(senha.trim(), usersRows[0].senha);
    console.log("senhaValida", senhaValida);

    if (!senhaValida) {
      return res
        .status(401)
        .json({ success: false, message: "Senha incorreta." });
    }

    const token = jwt.sign(
      {
        id: usersRows[0].id,
        permissions: usersRows[0].permissions,
        email: usersRows[0].email,
        nome: usersRows[0].nome,
        perfil: usersRows[0].perfil,
        ativo: usersRows[0].ativo,
        ultimo_login: usersRows[0].ultimo_login,
        created_at: usersRows[0].created_at,
        updated_at: usersRows[0].updated_at,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    connection.release();

    return res.json({
      success: true,
      user: {
        id: usersRows[0].id,
        nome: usersRows[0].nome,
        email: usersRows[0].email,
        perfil: usersRows[0].perfil,
        permissions: usersRows[0].permissions,
      },
      token: token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    if (connection) connection.release();
    return res
      .status(500)
      .json({ success: false, message: "Erro ao realizar login." });
  }
};

module.exports = {
  login,
};
