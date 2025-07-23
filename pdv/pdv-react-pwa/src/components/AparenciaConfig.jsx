import React, { useState } from "react";

export default function AparenciaConfig() {
  const [form, setForm] = useState({
    tema: "claro",
    corPrincipal: "#2563eb",
    corSecundaria: "#16a34a",
    fonte: "Inter",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Aparência do Sistema</h2>
      <div className="mb-3">
        <label className="block font-medium">Tema</label>
        <select
          name="tema"
          value={form.tema}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="claro">Claro</option>
          <option value="escuro">Escuro</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block font-medium">Cor Principal</label>
        <input
          type="color"
          name="corPrincipal"
          value={form.corPrincipal}
          onChange={handleChange}
          className="w-12 h-8 p-0 border-none"
        />
      </div>
      <div className="mb-3">
        <label className="block font-medium">Cor Secundária</label>
        <input
          type="color"
          name="corSecundaria"
          value={form.corSecundaria}
          onChange={handleChange}
          className="w-12 h-8 p-0 border-none"
        />
      </div>
      <div className="mb-3">
        <label className="block font-medium">Fonte</label>
        <select
          name="fonte"
          value={form.fonte}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Arial">Arial</option>
        </select>
      </div>
      <button
        type="button"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled
      >
        Salvar (em breve)
      </button>
    </form>
  );
}
