// Middleware para autorizar ações sensíveis no PDV

const { pool } = require("../config/database");
const jwt = require("jsonwebtoken");
const autorizar = async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Verificar se há um usuário já autorizado no body
    if (req.body.usuario && req.body.usuario.id) {
      // Buscar dados completos do usuário
      const [usuarios] = await connection.query(
        "SELECT id, nome, perfil, permissions, id_loja FROM users WHERE id = ?",
        [req.body.usuario.id]
      );

      if (usuarios.length > 0) {
        req.user = usuarios[0];
        return next();
      } else {
        return res.status(401).json({
          sucesso: false,
          mensagem: "Usuário autorizado não encontrado no banco",
        });
      }
    }

    // Verificar se há um autorizador no body
    const autorizador = req.body.usuario?.autorizador?.trim();

    if (autorizador) {
      // Se há autorizador, verificar se ele existe no banco
      const [autorizadores] = await connection.query(
        "SELECT * FROM autorizadores WHERE autorizador = ?",
        [autorizador]
      );
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

      // Definir o usuário como o autorizador encontrado
      req.user = {
        id: autorizadores[0].usuario_id,
        id_loja: autorizadores[0].id_loja,
      };

      return next();
    }

    // Se não há autorizador, verificar se há token de autenticação
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token de autenticação não fornecido",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuário pelo id
      const [usuarios] = await connection.query(
        "SELECT id, nome, perfil, senha, permissions, id_loja FROM users WHERE id = ?",
        [decoded.id]
      );
      if (!usuarios.length) {
        return res
          .status(401)
          .json({ sucesso: false, mensagem: "Usuário não encontrado" });
      }
      const usuario = usuarios[0];

      // Verificar se o usuário tem permissão para autorizar
      let permissions = usuario.permissions;

      if (typeof permissions === "string") {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = [];
        }
      }

      if (
        !permissions.includes("pdv.authorize") &&
        !permissions.includes("*")
      ) {
        return res.status(403).json({
          sucesso: false,
          mensagem: "Usuário não tem permissão para autorizar",
        });
      }

      req.user = usuario;
      return next();
    } catch (jwtError) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token inválido ou expirado",
      });
    }
  } catch (error) {
    console.error("Erro no middleware autorizar:", error);
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
