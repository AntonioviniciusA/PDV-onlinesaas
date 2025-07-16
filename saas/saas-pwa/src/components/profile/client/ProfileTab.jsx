import React, { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";
import { profileService } from "../../../services/profileService";

const ProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getClienteProfile();
        setProfile(data.profile);
        setForm(data.profile);
      } catch (error) {
        console.error("Erro ao carregar o perfil do cliente:", error.message);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm(profile);
    setSuccess("");
    setError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      await profileService.updateClienteProfile(form);
      setProfile(form);
      setEditMode(false);
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err) {
      setError("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div>Carregando...</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <User className="w-10 h-10 text-blue-500" />
        <div>
          <h2 className="text-xl font-bold">{profile.nome_representante}</h2>
          <p className="text-gray-600">{profile.email}</p>
        </div>
        {!editMode && (
          <button
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-1 hover:bg-blue-600"
            onClick={handleEdit}
          >
            <Edit className="w-4 h-4" /> Editar
          </button>
        )}
      </div>
      {success && <div className="text-green-600">{success}</div>}
      {error && <div className="text-red-600">{error}</div>}
      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <Mail className="w-4 h-4 mr-2" />
            Email:
            {editMode ? (
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className="ml-2 border rounded px-2 py-1"
                required
              />
            ) : (
              <span className="ml-2">{profile.email}</span>
            )}
          </div>
          <div className="flex items-center mb-2">
            <Phone className="w-4 h-4 mr-2" />
            Telefone:
            {editMode ? (
              <input
                type="text"
                name="telefone"
                value={form.telefone || ""}
                onChange={handleChange}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              <span className="ml-2">{profile.telefone}</span>
            )}
          </div>
          <div className="flex items-center mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            Endereço:
            {editMode ? (
              <input
                type="text"
                name="endereco"
                value={form.endereco || ""}
                onChange={handleChange}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              <span className="ml-2">{profile.endereco}</span>
            )}
          </div>
          <div className="flex items-center mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            Cidade:
            {editMode ? (
              <input
                type="text"
                name="cidade"
                value={form.cidade || ""}
                onChange={handleChange}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              <span className="ml-2">{profile.cidade}</span>
            )}
          </div>
          <div className="flex items-center mb-2">
            Estado:
            {editMode ? (
              <input
                type="text"
                name="estado"
                value={form.estado || ""}
                onChange={handleChange}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              <span className="ml-2">{profile.estado}</span>
            )}
          </div>
          <div className="flex items-center mb-2">
            CEP:
            {editMode ? (
              <input
                type="text"
                name="cep"
                value={form.cep || ""}
                onChange={handleChange}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              <span className="ml-2">{profile.cep}</span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-2">
            Razão Social:
            {editMode ? (
              <input
                type="text"
                name="razao_social"
                value={form.razao_social || ""}
                onChange={handleChange}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              <span className="ml-2">{profile.razao_social}</span>
            )}
          </div>
          <div className="mb-2">
            CNPJ:
            {editMode ? (
              <input
                type="text"
                name="cnpj"
                value={form.cnpj || ""}
                onChange={handleChange}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              <span className="ml-2">{profile.cnpj}</span>
            )}
          </div>
          <div className="mb-2">
            CPF:
            {editMode ? (
              <input
                type="text"
                name="cpf"
                value={form.cpf || ""}
                onChange={handleChange}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              <span className="ml-2">{profile.cpf}</span>
            )}
          </div>
        </div>
        {editMode && (
          <div className="col-span-2 flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              Salvar
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
export default ProfileTab;
