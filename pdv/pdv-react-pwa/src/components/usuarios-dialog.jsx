import React, { useState } from "react";

const mockUsuarios = [
  { id: 1, nome: "Administrador", email: "admin@pdv.com", cargo: "Admin" },
  { id: 2, nome: "Operador 1", email: "op1@pdv.com", cargo: "Operador" },
];

export default function UsuariosDialog() {
  const [usuarios, setUsuarios] = useState(mockUsuarios);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    cargo: "Operador",
  });
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setUsuarios(
        usuarios.map((u) => (u.id === editId ? { ...u, ...form } : u)),
      );
      setEditId(null);
    } else {
      setUsuarios([...usuarios, { ...form, id: Date.now() }]);
    }
    setForm({ nome: "", email: "", senha: "", cargo: "Operador" });
  };

  const handleEdit = (usuario) => {
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      cargo: usuario.cargo,
    });
    setEditId(usuario.id);
  };

  const handleDelete = (id) => {
    setUsuarios(usuarios.filter((u) => u.id !== id));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Usuários Locais</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Nome"
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="senha"
          value={form.senha}
          onChange={handleChange}
          placeholder="Senha"
          type="password"
          className="border p-2 rounded w-full"
          required={!editId}
        />
        <select
          name="cargo"
          value={form.cargo}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="Admin">Admin</option>
          <option value="Operador">Operador</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editId ? "Salvar" : "Adicionar"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ nome: "", email: "", senha: "", cargo: "Operador" });
            }}
            className="ml-2 text-gray-600"
          >
            Cancelar
          </button>
        )}
      </form>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Nome</th>
            <th className="p-2">Email</th>
            <th className="p-2">Cargo</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.nome}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.cargo}</td>
              <td className="p-2">
                <button
                  onClick={() => handleEdit(u)}
                  className="text-blue-600 mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="text-red-600"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
