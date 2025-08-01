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
import {
  Loader2,
  Save,
  RefreshCw,
  Edit,
  X,
  Users,
  Settings,
  Plus,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function ConfiguracoesSistema() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [timezones, setTimezones] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [activeTab, setActiveTab] = useState("sistema");
  const [configuracoes, setConfiguracoes] = useState({
    numero_caixa: 1,
    link_api_cupom: "",
    timezone: "America/Sao_Paulo",
    bd_backup: false,
    bd_central: false,
    url_servidor_central: "",
    sincronizacao_automatico: false,
    intervalo_sincronizacao: 10,
  });
  const [configuracoesOriginal, setConfiguracoesOriginal] = useState({
    numero_caixa: 1,
    link_api_cupom: "",
    timezone: "America/Sao_Paulo",
    bd_backup: false,
    bd_central: false,
    url_servidor_central: "",
    sincronizacao_automatico: false,
    intervalo_sincronizacao: 10,
  });

  // Estados para gerenciamento de usuários
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "operador",
    permissions: [],
    ativo: true,
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
          numero_caixa: configResponse.configuracoes.numero_caixa || 1,
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

      // Carregar permissões
      const permissoesResponse =
        await configuracoesSistemaService.getPermissoes();
      if (permissoesResponse.sucesso) {
        setPermissoes(permissoesResponse.permissoes || []);
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
        toast({
          title: "Erro",
          description: response.mensagem || "Erro ao salvar configurações",
          variant: "destructive",
        });
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

  // Funções para gerenciamento de usuários
  const loadUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const response = await configuracoesSistemaService.getUsuarios();
      if (response.sucesso) {
        setUsuarios(response.usuarios || []);
      } else {
        toast({
          title: "Erro",
          description: response.mensagem || "Erro ao carregar usuários",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingUsuarios(false);
    }
  };
  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleNewUser = () => {
    setEditingUser(null);
    setUserForm({
      nome: "",
      email: "",
      senha: "",
      perfil: "operador",
      permissions: [],
      ativo: true,
    });
    setShowUserDialog(true);
  };

  const aplicarPermissoesPadrao = (perfil) => {
    let permissoesPadrao = [];
    switch (perfil) {
      case "admin":
        permissoesPadrao = ["*"];
        break;
      case "gerente":
        permissoesPadrao = [
          "pdv.operate",
          "pdv.authorize",
          "pdv.products",
          "pdv.reports",
          "pdv.cash",
          "pdv.labels",
          "manage.users",
        ];
        break;
      case "operador":
        permissoesPadrao = ["pdv.operate", "pdv.products"];
        break;
      case "fiscal":
        permissoesPadrao = ["pdv.operate", "pdv.authorize", "reports.view"];
        break;
      default:
        permissoesPadrao = ["pdv.operate"];
    }
    setUserForm((prev) => ({ ...prev, permissions: permissoesPadrao }));
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      nome: user.nome,
      email: user.email,
      senha: "",
      perfil: user.perfil,
      permissions:
        typeof user.permissions === "string"
          ? JSON.parse(user.permissions)
          : user.permissions || [],
      ativo: user.ativo,
    });
    setShowUserDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      const response = editingUser
        ? await configuracoesSistemaService.updateUsuario(
            editingUser.id,
            userForm
          )
        : await configuracoesSistemaService.createUsuario(userForm);

      if (response.sucesso) {
        setShowUserDialog(false);
        loadUsuarios();
        toast({
          title: "Sucesso",
          description: `Usuário ${
            editingUser ? "atualizado" : "criado"
          } com sucesso!`,
        });
      } else {
        toast({
          title: "Erro",
          description: response.mensagem || "Erro ao salvar usuário",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar usuário: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await configuracoesSistemaService.deleteUsuario(
        userToDelete
      );
      if (response.sucesso) {
        loadUsuarios();
        toast({
          title: "Sucesso",
          description: "Usuário excluído com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: response.mensagem || "Erro ao excluir usuário",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Carregar usuários quando a aba for ativada
  useEffect(() => {
    if (activeTab === "usuarios") {
      loadUsuarios();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="flex items-center bg-black text-white mb-2">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-white" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription className="text-gray-400">
            Gerencie as configurações e usuários do sistema PDV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sistema" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Sistema
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sistema" className="space-y-6">
              {/* Conteúdo da aba Sistema */}
              {/* Configurações da API */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações da API</h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_caixa">Número do Caixa</Label>
                    {editing ? (
                      <Input
                        id="numero_caixa"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={configuracoes.numero_caixa}
                        onChange={(e) =>
                          handleInputChange(
                            "numero_caixa",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md text-sm">
                        {configuracoes.numero_caixa || "1"}
                      </div>
                    )}
                  </div>

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
                        {timezones.find(
                          (tz) => tz.value === configuracoes.timezone
                        )?.label || configuracoes.timezone}
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
                          Habilita sincronização com banco central
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

                  {(configuracoes.bd_central || !editing) && (
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
                          {configuracoes.url_servidor_central ||
                            "Não configurado"}
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
                  <Button
                    onClick={handleEdit}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Configurações
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="usuarios" className="space-y-6">
              {/* Conteúdo da aba Usuários */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Gerenciar Usuários</h3>
                  <Button
                    onClick={handleNewUser}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Usuário
                  </Button>
                </div>

                {loadingUsuarios ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Carregando usuários...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {usuarios.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{user.nome}</h4>
                            <span className="text-sm text-muted-foreground">
                              ({user.email})
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.ativo
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.ativo ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Perfil: {user.perfil}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Permissões:{" "}
                            {user.permissions
                              ? (() => {
                                  try {
                                    const perms =
                                      typeof user.permissions === "string"
                                        ? JSON.parse(user.permissions)
                                        : user.permissions;
                                    return Array.isArray(perms)
                                      ? perms.join(", ")
                                      : "Nenhuma";
                                  } catch (e) {
                                    return "Erro ao carregar";
                                  }
                                })()
                              : "Nenhuma"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog para criar/editar usuário */}
      {showUserDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-nome" className="text-sm font-medium">
                    Nome
                  </Label>
                  <Input
                    id="user-nome"
                    value={userForm.nome}
                    onChange={(e) =>
                      setUserForm((prev) => ({ ...prev, nome: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="user-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-senha" className="text-sm font-medium">
                    {editingUser
                      ? "Nova Senha (deixe em branco para manter)"
                      : "Senha"}
                  </Label>
                  <Input
                    id="user-senha"
                    type="password"
                    value={userForm.senha}
                    onChange={(e) =>
                      setUserForm((prev) => ({
                        ...prev,
                        senha: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="user-perfil" className="text-sm font-medium">
                    Perfil
                  </Label>
                  <Select
                    value={userForm.perfil}
                    onValueChange={(value) => {
                      setUserForm((prev) => ({ ...prev, perfil: value }));
                      aplicarPermissoesPadrao(value);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operador">Operador</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="fiscal">Fiscal</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">Permissões</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => aplicarPermissoesPadrao(userForm.perfil)}
                  >
                    Aplicar Padrão
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded-md p-4">
                  {permissoes.map((categoria) => (
                    <div key={categoria.categoria} className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">
                        {categoria.categoria}
                      </h4>
                      <div className="space-y-2">
                        {categoria.permissoes.map((permissao) => (
                          <label
                            key={permissao.value}
                            className="flex items-center space-x-3 text-sm hover:bg-gray-50 p-2 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={userForm.permissions.includes(
                                permissao.value
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setUserForm((prev) => ({
                                    ...prev,
                                    permissions: [
                                      ...prev.permissions,
                                      permissao.value,
                                    ],
                                  }));
                                } else {
                                  setUserForm((prev) => ({
                                    ...prev,
                                    permissions: prev.permissions.filter(
                                      (p) => p !== permissao.value
                                    ),
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="flex-1">{permissao.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="user-ativo" className="text-sm font-medium">
                    Status do Usuário
                  </Label>
                  <p className="text-xs text-gray-500">
                    Define se o usuário pode acessar o sistema
                  </p>
                </div>
                <Switch
                  id="user-ativo"
                  checked={userForm.ativo}
                  onCheckedChange={(checked) =>
                    setUserForm((prev) => ({ ...prev, ativo: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t">
              <Button
                onClick={handleSaveUser}
                className="flex-1 h-10"
                size="lg"
              >
                {editingUser ? "Atualizar Usuário" : "Criar Usuário"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUserDialog(false)}
                className="flex-1 h-10"
                size="lg"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de confirmação de exclusão */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir este usuário? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
