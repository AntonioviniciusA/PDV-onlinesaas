import { useState, useEffect } from "react";
import { Button } from "../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Separator } from "../components/ui/separator.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { ScrollArea } from "../components/ui/scroll-area.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog.jsx";
import {
  History,
  Search,
  Filter,
  Printer,
  Eye,
  CreditCard,
  Banknote,
  QrCode,
  ArrowLeft,
  TrendingUp,
  Calculator,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts.js";
import { KeyboardShortcutsHelp } from "../components/keyboard-shortcuts-help.jsx";
import { BtnVoltarPDV } from "../components/BtnVoltarPDV.jsx";
import { useNavigate } from "react-router-dom";
import { caixaService } from "../services/caixaServices.js";
import { formatDateTimeBR, isSameDate } from "../utils/dateUtils.js";

export default function HistoricoVendas() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [caixaOperacaoFilter, setCaixaOperacaoFilter] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar dados do histórico de vendas
  useEffect(() => {
    const loadHistoricoVendas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await caixaService.getHistoricoCaixas(
          searchTerm || undefined,
          dateFilter || undefined,
          paymentFilter === "todos" ? undefined : paymentFilter,
          caixaOperacaoFilter ? "true" : undefined
        );
        if (response.sucesso) {
          setSalesData(response.vendas || []);
        }
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        setError("Erro ao carregar histórico de vendas");
      } finally {
        setLoading(false);
      }
    };

    loadHistoricoVendas();
  }, [searchTerm, dateFilter, paymentFilter, caixaOperacaoFilter]);

  // Definir atalhos de teclado para o histórico
  const shortcuts = useKeyboardShortcuts([
    {
      key: "Escape",
      action: () => navigate("/pdv"),
      description: "Voltar ao PDV",
    },
    {
      key: "F8",
      action: () => {
        const searchInput = document.getElementById("search");
        searchInput?.focus();
      },
      description: "Buscar Venda",
    },
    {
      key: "F1",
      action: () => {
        setSearchTerm("");
        setDateFilter("");
        setPaymentFilter("todos");
        setCaixaOperacaoFilter(false);
      },
      description: "Limpar Filtros",
    },
    {
      key: "F2",
      action: () => {
        setCaixaOperacaoFilter(!caixaOperacaoFilter);
      },
      description: "Alternar Filtro Caixa",
    },
  ]);

  const filteredSales = salesData.filter((sale) => {
    const matchesSearch =
      sale.id_integracao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.operador_nome?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || isSameDate(sale.data, dateFilter);

    const matchesPayment =
      paymentFilter === "todos" || sale.forma_pagamento === paymentFilter;

    return matchesSearch && matchesDate && matchesPayment;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;

  const getPaymentIcon = (method) => {
    switch (method) {
      case "dinheiro":
        return <Banknote className="w-4 h-4" />;
      case "cartao":
      case "credito":
      case "debito":
        return <CreditCard className="w-4 h-4" />;
      case "pix":
        return <QrCode className="w-4 h-4" />;
      case "misto":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Banknote className="w-4 h-4" />;
    }
  };

  const getPaymentLabel = (method) => {
    switch (method) {
      case "dinheiro":
        return "Dinheiro";
      case "cartao":
        return "Cartão";
      case "credito":
        return "Crédito";
      case "debito":
        return "Débito";
      case "pix":
        return "PIX";
      case "misto":
        return "Misto";
      default:
        return method;
    }
  };

  const handlePrint = (sale) => {
    // Aqui você implementaria a lógica de impressão
    alert(`Reimprimindo cupom da venda ${sale.id_integracao}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <BtnVoltarPDV />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Histórico de Vendas
            </h1>
            <p className="text-gray-600">
              Consulte e reimprima vendas anteriores
            </p>
          </div>
          <KeyboardShortcutsHelp shortcuts={shortcuts} />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total em Vendas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `R$ ${totalSales.toFixed(2)}`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Transações</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      totalTransactions
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `R$ ${
                        totalTransactions > 0
                          ? (totalSales / totalTransactions).toFixed(2)
                          : "0.00"
                      }`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nº venda ou operador..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select
                    value={paymentFilter}
                    onValueChange={setPaymentFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                      <SelectItem value="debito">Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="misto">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="caixa-operacao"
                    checked={caixaOperacaoFilter}
                    onChange={(e) => setCaixaOperacaoFilter(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label
                    htmlFor="caixa-operacao"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Apenas caixa em operação
                  </Label>
                </div>

                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("");
                    setPaymentFilter("todos");
                    setCaixaOperacaoFilter(false);
                  }}
                  variant="outline"
                  className="w-full"
                  title="F1"
                >
                  Limpar Filtros (F1)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Vendas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Vendas ({filteredSales.length})
                  {caixaOperacaoFilter && (
                    <Badge variant="secondary" className="ml-2">
                      <CheckSquare className="w-3 h-3 mr-1" />
                      Caixa Ativo
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">
                        Carregando vendas...
                      </span>
                    </div>
                  ) : filteredSales.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma venda encontrada
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredSales.map((sale) => {
                        // Usar as datas já formatadas pelo backend
                        const date = sale.criado_em_formatado?.date || "N/A";
                        const time = sale.criado_em_formatado?.time || "N/A";
                        return (
                          <Card key={sale.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge
                                    variant="outline"
                                    className="font-mono"
                                  >
                                    {sale.id_integracao}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    {getPaymentIcon(sale.forma_pagamento)}
                                    <span className="text-sm text-gray-600">
                                      {getPaymentLabel(sale.forma_pagamento)}
                                    </span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Data</p>
                                    <p className="font-medium">{date}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Hora</p>
                                    <p className="font-medium">{time}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Operador</p>
                                    <p className="font-medium">
                                      {sale.operador_nome || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Total</p>
                                    <p className="font-bold text-green-600">
                                      R$ {Number(sale.total).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setSelectedSale(sale)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Detalhes da Venda {sale.id_integracao}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-gray-500">
                                            Data/Hora
                                          </p>
                                          <p>
                                            {date} às {time}
                                            {sale.timezone && (
                                              <span className="text-xs text-gray-500 ml-1">
                                                ({sale.timezone})
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500">
                                            Operador
                                          </p>
                                          <p>{sale.operador_nome || "N/A"}</p>
                                        </div>
                                      </div>
                                      <Separator />
                                      <div>
                                        <p className="font-medium mb-2">
                                          Itens:
                                        </p>
                                        <div className="space-y-2">
                                          {sale.itens &&
                                          sale.itens.length > 0 ? (
                                            sale.itens.map((item) => (
                                              <div
                                                key={item.id}
                                                className="flex justify-between text-sm"
                                              >
                                                <span>
                                                  {item.quantidade}x{" "}
                                                  {item.descricao}
                                                </span>
                                                <span>
                                                  R${" "}
                                                  {Number(
                                                    item.valor_total
                                                  ).toFixed(2)}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-gray-500 text-sm">
                                              Nenhum item encontrado
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <Separator />
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span>Subtotal:</span>
                                          <span>
                                            R${" "}
                                            {(
                                              Number(sale.total) +
                                              Number(sale.desconto || 0)
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                        {sale.desconto &&
                                          Number(sale.desconto) > 0 && (
                                            <div className="flex justify-between text-red-600">
                                              <span>Desconto:</span>
                                              <span>
                                                -R${" "}
                                                {Number(sale.desconto).toFixed(
                                                  2
                                                )}
                                              </span>
                                            </div>
                                          )}
                                        <div className="flex justify-between font-bold">
                                          <span>Total:</span>
                                          <span>
                                            R$ {Number(sale.total).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="sm"
                                  onClick={() => handlePrint(sale)}
                                >
                                  <Printer className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
