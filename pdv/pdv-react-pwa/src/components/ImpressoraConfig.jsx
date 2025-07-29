import React, { useEffect, useState } from "react";
import { impressoraService } from "../services/impressoraService";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { useToast } from "../hooks/use-toast";
import {
  Loader2,
  Save,
  RefreshCw,
  Printer,
  Search,
  Edit,
  X,
} from "lucide-react";

const tipos = ["EPSON", "STAR", "BIXOLON"];
const charsets = ["PC860_PORTUGUESE", "PC850_MULTILINGUAL", "PC437_USA"];

export default function ImpressoraConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    interface: "",
    type: "EPSON",
    characterSet: "PC860_PORTUGUESE",
    removeSpecialCharacters: false,
    lineCharacter: "-",
    name: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [impressoras, setImpressoras] = useState([]);
  const [listando, setListando] = useState(false);
  const [configOriginal, setConfigOriginal] = useState(null);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        const res = await impressoraService.getImpressoraConfig();
        if (res.config) {
          setConfig(res.config);
          setConfigOriginal(res.config);
        }
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao carregar configuração da impressora",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [toast]);

  const listarImpressoras = async () => {
    setListando(true);
    try {
      const res = await impressoraService.listarImpressoras();
      if (res.success) {
        setImpressoras(res.printers);
        if (res.printers.length === 0) {
          toast({
            title: "Aviso",
            description: "Nenhuma impressora encontrada.",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: res.message || "Erro ao listar impressoras",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao listar impressoras",
        variant: "destructive",
      });
    } finally {
      setListando(false);
    }
  };

  const handleChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImpressoraSelect = (nome) => {
    setConfig((prev) => ({
      ...prev,
      interface: nome ? `printer:${nome}` : "",
      name: nome,
    }));
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setConfig(configOriginal);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await impressoraService.setImpressoraConfig(config);
      if (res.success) {
        setConfigOriginal(config);
        setEditing(false);
        toast({
          title: "Sucesso",
          description: "Configuração salva com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: res.message || "Erro ao salvar configuração",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando configuração da impressora...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="flex items-center bg-black text-white mb-2">
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Configuração da Impressora
          </CardTitle>
          <CardDescription>
            Configure a impressora térmica para impressão de recibos e etiquetas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 w-full">
          {/* Configurações de Impressora */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Configurações da Impressora
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={listarImpressoras}
                  disabled={listando || !editing}
                  className="flex items-center gap-2"
                >
                  {listando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {listando ? "Buscando..." : "Listar Impressoras"}
                </Button>

                {impressoras.length > 0 && editing && (
                  <Select
                    value={config.name || ""}
                    onValueChange={handleImpressoraSelect}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Selecione uma impressora" />
                    </SelectTrigger>
                    <SelectContent>
                      {impressoras.map((nome) => (
                        <SelectItem key={nome} value={nome}>
                          {nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interface">Interface</Label>
                  {editing ? (
                    <Input
                      id="interface"
                      value={config.interface || ""}
                      onChange={(e) =>
                        handleChange("interface", e.target.value)
                      }
                      placeholder="printer:nome_impressora"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {config.interface || "Não configurado"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  {editing ? (
                    <Select
                      value={config.type || "EPSON"}
                      onValueChange={(value) => handleChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tipos.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {config.type || "EPSON"}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="characterSet">Character Set</Label>
                  {editing ? (
                    <Select
                      value={config.characterSet || "PC860_PORTUGUESE"}
                      onValueChange={(value) =>
                        handleChange("characterSet", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {charsets.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {config.characterSet || "PC860_PORTUGUESE"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lineCharacter">Caractere de Linha</Label>
                  {editing ? (
                    <Input
                      id="lineCharacter"
                      value={config.lineCharacter || "-"}
                      onChange={(e) =>
                        handleChange("lineCharacter", e.target.value)
                      }
                      placeholder="-"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {config.lineCharacter || "-"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Remover Caracteres Especiais</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove caracteres especiais da impressão
                  </p>
                </div>
                {editing ? (
                  <Switch
                    checked={!!config.removeSpecialCharacters}
                    onCheckedChange={(checked) =>
                      handleChange("removeSpecialCharacters", checked)
                    }
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {config.removeSpecialCharacters ? "Ativado" : "Desativado"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            {editing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Salvando..." : "Salvar Configuração"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar Configuração
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={loading || editing}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
