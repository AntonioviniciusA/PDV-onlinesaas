import React, { useEffect, useState } from "react";
import { impressoraService } from "../services/impressoraService";

const tipos = ["EPSON", "STAR", "BIXOLON"];
const charsets = ["PC860_PORTUGUESE", "PC850_MULTILINGUAL", "PC437_USA"];

export default function ImpressoraConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [impressoras, setImpressoras] = useState([]);
  const [listando, setListando] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        const res = await impressoraService.getImpressoraConfig();
        setConfig(res.config);
      } catch (err) {
        setMsg("Erro ao carregar configuração da impressora");
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const listarImpressoras = async () => {
    setListando(true);
    setMsg("");
    try {
      const res = await impressoraService.listarImpressoras();
      if (res.success) {
        setImpressoras(res.printers);
        if (res.printers.length === 0) setMsg("Nenhuma impressora encontrada.");
      } else {
        setMsg(res.message || "Erro ao listar impressoras");
      }
    } catch (err) {
      setMsg("Erro ao listar impressoras");
    } finally {
      setListando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImpressoraSelect = (e) => {
    const nome = e.target.value;
    setConfig((prev) => ({
      ...prev,
      interface: nome ? `printer:${nome}` : "",
      name: nome,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await impressoraService.setImpressoraConfig(config);
      if (res.success) {
        setMsg("Configuração salva com sucesso!");
      } else {
        setMsg(res.message || "Erro ao salvar configuração");
      }
    } catch (err) {
      setMsg("Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Carregando configuração da impressora...</div>;
  if (!config) return <div>Não foi possível carregar a configuração.</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Configuração da Impressora</h2>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          className="bg-gray-200 px-2 py-1 rounded text-sm"
          onClick={listarImpressoras}
          disabled={listando}
        >
          {listando ? "Buscando..." : "Listar Impressoras"}
        </button>
        {impressoras.length > 0 && (
          <select
            onChange={handleImpressoraSelect}
            className="border rounded px-2 py-1"
            value={config.name || ""}
          >
            <option value="">Selecione uma impressora</option>
            {impressoras.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="mb-3">
        <label className="block font-medium">Interface</label>
        <input
          type="text"
          name="interface"
          value={config.interface || ""}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div className="mb-3">
        <label className="block font-medium">Tipo</label>
        <select
          name="type"
          value={config.type || ""}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        >
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="block font-medium">Character Set</label>
        <select
          name="characterSet"
          value={config.characterSet || ""}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        >
          {charsets.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="block font-medium">
          Remover Caracteres Especiais
        </label>
        <input
          type="checkbox"
          name="removeSpecialCharacters"
          checked={!!config.removeSpecialCharacters}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label className="block font-medium">Caractere de Linha</label>
        <input
          type="text"
          name="lineCharacter"
          value={config.lineCharacter || ""}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={saving}
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
      {msg && <div className="mt-2 text-sm text-gray-700">{msg}</div>}
    </form>
  );
}
