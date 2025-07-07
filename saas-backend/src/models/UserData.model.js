const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserData = sequelize.define(
  "UserData",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "ID do usuário proprietário dos dados",
    },
    data_type: {
      type: DataTypes.ENUM(
        "file",
        "document",
        "image",
        "video",
        "audio",
        "other"
      ),
      allowNull: false,
      comment: "Tipo de dado armazenado",
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Nome do arquivo",
    },
    original_filename: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Nome original do arquivo",
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Caminho do arquivo no sistema",
    },
    file_size_bytes: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "Tamanho do arquivo em bytes",
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Tipo MIME do arquivo",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Metadados adicionais do arquivo",
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Tags para organização",
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Se o arquivo é público",
    },
    download_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Número de downloads",
    },
    last_accessed: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Última vez que foi acessado",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Se o arquivo está ativo",
    },
  },
  {
    tableName: "user_data",
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["data_type"],
      },
      {
        fields: ["is_active"],
      },
      {
        fields: ["created_at"],
      },
    ],
  }
);

// Método para obter tamanho em MB
UserData.prototype.getSizeInMB = function () {
  return (this.file_size_bytes / (1024 * 1024)).toFixed(2);
};

// Método para obter tamanho em GB
UserData.prototype.getSizeInGB = function () {
  return (this.file_size_bytes / (1024 * 1024 * 1024)).toFixed(2);
};

// Método para verificar se é um arquivo de imagem
UserData.prototype.isImage = function () {
  return (
    this.data_type === "image" ||
    (this.mime_type && this.mime_type.startsWith("image/"))
  );
};

// Método para verificar se é um arquivo de vídeo
UserData.prototype.isVideo = function () {
  return (
    this.data_type === "video" ||
    (this.mime_type && this.mime_type.startsWith("video/"))
  );
};

// Método para obter URL pública (se aplicável)
UserData.prototype.getPublicUrl = function () {
  if (!this.is_public) return null;
  return `/api/files/${this.id}`;
};

module.exports = UserData;
