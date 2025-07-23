// Middleware para autorizar ações sensíveis no PDV

const { pool } = require("../config/database");
const jwt = require("jsonwebtoken");
const autorizar = async (req, res, next) => {
  let connection;
  try {
    console.log("Autorizar middleware");
    console.log("req.body", req.body);
    connection = await pool.getConnection();
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(400)
        .json({ sucesso: false, mensagem: "Entrada não informada" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const autorizador = req.body.usuario.autorizador.trim();

    console.log("Autorizador: ", autorizador);
    if (autorizador) {
      const [autorizadores] = await connection.query(
        "SELECT * FROM autorizadores WHERE autorizador = ?",
        [autorizador]
      );
      console.log("Autorizadores: ", autorizadores);
      if (!autorizadores.length) {
        return res
          .status(401)
          .json({ sucesso: false, mensagem: "Autorizador não encontrado" });
      }
      // Se encontrou o autorizador, remove do banco e retorna sucesso
      await connection.query(
        "DELETE FROM autorizadores WHERE autorizador = ?",
        [autorizador]
      );
      console.log("Autorizador removido com sucesso");
      return next();
    }
    try {
      // Buscar usuário pelo id
      const [usuarios] = await connection.query(
        "SELECT id, nome, perfil, senha, permissions FROM users WHERE id = ?",
        [decoded.id]
      );
      if (!usuarios.length) {
        return res
          .status(401)
          .json({ sucesso: false, mensagem: "Usuário não encontrado" });
      }
      const usuario = usuarios[0];
      if (!usuario.permissions.includes("pdv.authorize")) {
        return res.status(403).json({
          sucesso: false,
          mensagem: "Usuário não tem permissão para autorizar",
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao autorizar",
        erro: error.message,
      });
    } finally {
      if (connection) connection.release();
    }
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao autorizar",
      erro: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = autorizar;
