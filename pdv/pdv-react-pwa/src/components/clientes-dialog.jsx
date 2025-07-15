import React, { useState } from "react";

const mockClientes = [
  { id: 1, nome: "João Silva", cpf: "123.456.789-00", telefone: "11999999999" },
  {
    id: 2,
    nome: "Maria Souza",
    cpf: "987.654.321-00",
    telefone: "11888888888",
  },
];

export default function ClientesDialog() {
  const [clientes, setClientes] = useState(mockClientes);
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "" });
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setClientes(
        clientes.map((c) => (c.id === editId ? { ...c, ...form } : c)),
      );
      setEditId(null);
    } else {
      setClientes([...clientes, { ...form, id: Date.now() }]);
    }
    setForm({ nome: "", cpf: "", telefone: "" });
  };

  const handleEdit = (cliente) => {
    setForm({
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
    });
    setEditId(cliente.id);
  };

  const handleDelete = (id) => {
    setClientes(clientes.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Clientes</h2>
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
          name="cpf"
          value={form.cpf}
          onChange={handleChange}
          placeholder="CPF"
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          placeholder="Telefone"
          className="border p-2 rounded w-full"
          required
        />
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
              setForm({ nome: "", cpf: "", telefone: "" });
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
            <th className="p-2">CPF</th>
            <th className="p-2">Telefone</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.nome}</td>
              <td className="p-2">{c.cpf}</td>
              <td className="p-2">{c.telefone}</td>
              <td className="p-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="text-blue-600 mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
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
