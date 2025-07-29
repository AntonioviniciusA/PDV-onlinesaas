import React, { useState, useEffect } from "react";
import { configuracoesSistemaService } from "../services/configuracoesSistemaService";
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
import { Loader2, Save, RefreshCw, Edit, X } from "lucide-react";

export default function ConfiguracoesSistema() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [timezones, setTimezones] = useState([]);
  const [configuracoes, setConfiguracoes] = useState({
    link_api_cupom: "",
    timezone: "America/Sao_Paulo",
    bd_backup: false,
    bd_central: false,
    url_servidor_central: "",
    sincronizacao_automatico: false,
    intervalo_sincronizacao: 10,
  });
  const [configuracoesOriginal, setConfiguracoesOriginal] = useState({
    link_api_cupom: "",
    timezone: "America/Sao_Paulo",
    bd_backup: false,
    bd_central: false,
    url_servidor_central: "",
    sincronizacao_automatico: false,
    intervalo_sincronizacao: 10,
  });

  // Carregar configurações e timezones
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar configurações
      const configResponse =
        await configuracoesSistemaService.getConfiguracoes();
      if (configResponse.sucesso && configResponse.configuracoes) {
        const configData = {
          link_api_cupom: configResponse.configuracoes.link_api_cupom || "",
          timezone:
            configResponse.configuracoes.timezone || "America/Sao_Paulo",
          bd_backup: configResponse.configuracoes.bd_backup || false,
          bd_central: configResponse.configuracoes.bd_central || false,
          url_servidor_central:
            configResponse.configuracoes.url_servidor_central || "",
          sincronizacao_automatico:
            configResponse.configuracoes.sincronizacao_automatico || false,
          intervalo_sincronizacao:
            configResponse.configuracoes.intervalo_sincronizacao || 10,
        };
        setConfiguracoes(configData);
        setConfiguracoesOriginal(configData);
      }

      // Carregar timezones
      const timezoneResponse = await configuracoesSistemaService.getTimezones();
      if (timezoneResponse.sucesso) {
        setTimezones(timezoneResponse.timezones || []);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfiguracoes((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setConfiguracoes(configuracoesOriginal);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await configuracoesSistemaService.updateConfiguracoes(
        configuracoes
      );

      if (response.sucesso) {
        setConfiguracoesOriginal(configuracoes);
        setEditing(false);
        toast({
          title: "Sucesso",
          description: "Configurações salvas com sucesso!",
        });
      } else {
        throw new Error(response.mensagem || "Erro ao salvar configurações");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações: " + error.message,
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
          <span className="ml-2">Carregando configurações...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="flex items-center bg-black text-white mb-2">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-white" />
            Configurações
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure as principais configurações do sistema PDV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 w-full">
          {/* Configurações da API */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configurações da API</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link_api_cupom">Link da API de Cupom</Label>
                {editing ? (
                  <Input
                    id="link_api_cupom"
                    type="url"
                    placeholder="http://localhost:3000/api/cupom"
                    value={configuracoes.link_api_cupom}
                    onChange={(e) =>
                      handleInputChange("link_api_cupom", e.target.value)
                    }
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {configuracoes.link_api_cupom || "Não configurado"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                {editing ? (
                  <Select
                    value={configuracoes.timezone}
                    onValueChange={(value) =>
                      handleInputChange("timezone", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {timezones.find((tz) => tz.value === configuracoes.timezone)
                      ?.label || configuracoes.timezone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configurações de Banco de Dados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Configurações de Banco de Dados
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilita backup automático do banco de dados
                    </p>
                  </div>
                  {editing ? (
                    <Switch
                      checked={configuracoes.bd_backup}
                      onCheckedChange={(checked) =>
                        handleInputChange("bd_backup", checked)
                      }
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md text-sm">
                      {configuracoes.bd_backup ? "Ativado" : "Desativado"}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Banco Central</Label>
                    <p className="text-sm text-muted-foreground">
                      Conecta com banco de dados central
                    </p>
                  </div>
                  {editing ? (
                    <Switch
                      checked={configuracoes.bd_central}
                      onCheckedChange={(checked) =>
                        handleInputChange("bd_central", checked)
                      }
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md text-sm">
                      {configuracoes.bd_central ? "Ativado" : "Desativado"}
                    </div>
                  )}
                </div>
              </div>

              {configuracoes.bd_central && (
                <div className="space-y-2">
                  <Label htmlFor="url_servidor_central">
                    URL do Servidor Central
                  </Label>
                  {editing ? (
                    <Input
                      id="url_servidor_central"
                      type="url"
                      placeholder="https://servidor-central.com/api"
                      value={configuracoes.url_servidor_central}
                      onChange={(e) =>
                        handleInputChange(
                          "url_servidor_central",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {configuracoes.url_servidor_central || "Não configurado"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Configurações de Sincronização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sincronização</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Sincronização Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilita sincronização automática de dados
                  </p>
                </div>
                {editing ? (
                  <Switch
                    checked={configuracoes.sincronizacao_automatico}
                    onCheckedChange={(checked) =>
                      handleInputChange("sincronizacao_automatico", checked)
                    }
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {configuracoes.sincronizacao_automatico
                      ? "Ativado"
                      : "Desativado"}
                  </div>
                )}
              </div>

              {(configuracoes.sincronizacao_automatico || !editing) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="intervalo_sincronizacao">
                      Intervalo de Sincronização (minutos)
                    </Label>
                    {editing ? (
                      <Input
                        id="intervalo_sincronizacao"
                        type="number"
                        min="1"
                        max="60"
                        value={configuracoes.intervalo_sincronizacao}
                        onChange={(e) =>
                          handleInputChange(
                            "intervalo_sincronizacao",
                            parseInt(e.target.value) || 10
                          )
                        }
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md text-sm">
                        {configuracoes.intervalo_sincronizacao} minutos
                      </div>
                    )}
                  </div>
                  <div></div> {/* Espaçador para manter o layout */}
                </div>
              )}
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
                  {saving ? "Salvando..." : "Salvar Configurações"}
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
                Editar Configurações
              </Button>
            )}

            <Button
              variant="outline"
              onClick={loadData}
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
