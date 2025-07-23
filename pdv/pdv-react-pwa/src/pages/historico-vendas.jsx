import { useState } from "react";
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
} from "lucide-react";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts.js";
import { KeyboardShortcutsHelp } from "../components/keyboard-shortcuts-help.jsx";
import { BtnVoltarPDV } from "../components/BtnVoltarPDV.jsx";
import { useNavigate } from "react-router-dom";

// Dados de exemplo das vendas
const salesData = [
  {
    id: "VD001",
    date: "2024-01-07",
    time: "14:30",
    items: [
      { id: "1", name: "Coca-Cola 350ml", price: 4.5, quantity: 2 },
      { id: "2", name: "Pão Francês (kg)", price: 8.9, quantity: 1 },
    ],
    subtotal: 17.9,
    discount: 0,
    total: 17.9,
    paymentMethod: "pix",
    operator: "João Silva",
  },
  {
    id: "VD002",
    date: "2024-01-07",
    time: "15:45",
    items: [
      { id: "3", name: "Leite Integral 1L", price: 5.2, quantity: 3 },
      { id: "4", name: "Arroz Branco 5kg", price: 22.9, quantity: 1 },
      { id: "5", name: "Feijão Preto 1kg", price: 7.8, quantity: 2 },
    ],
    subtotal: 54.1,
    discount: 5,
    total: 51.4,
    paymentMethod: "cartao",
    operator: "Maria Santos",
  },
  {
    id: "VD003",
    date: "2024-01-07",
    time: "16:20",
    items: [
      { id: "6", name: "Açúcar Cristal 1kg", price: 4.2, quantity: 1 },
      { id: "7", name: "Óleo de Soja 900ml", price: 6.9, quantity: 1 },
    ],
    subtotal: 11.1,
    discount: 0,
    total: 11.1,
    paymentMethod: "dinheiro",
    operator: "João Silva",
  },
  {
    id: "VD004",
    date: "2024-01-06",
    time: "10:15",
    items: [
      { id: "8", name: "Macarrão Espaguete", price: 3.8, quantity: 4 },
      { id: "1", name: "Coca-Cola 350ml", price: 4.5, quantity: 1 },
    ],
    subtotal: 19.7,
    discount: 10,
    total: 17.73,
    paymentMethod: "pix",
    operator: "Ana Costa",
  },
  {
    id: "VD005",
    date: "2024-01-06",
    time: "11:30",
    items: [
      { id: "4", name: "Arroz Branco 5kg", price: 22.9, quantity: 2 },
      { id: "5", name: "Feijão Preto 1kg", price: 7.8, quantity: 3 },
    ],
    subtotal: 69.2,
    discount: 0,
    total: 69.2,
    paymentMethod: "cartao",
    operator: "Maria Santos",
  },
];

export default function HistoricoVendas() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [selectedSale, setSelectedSale] = useState(null); // eslint-disable-line no-unused-vars

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
      },
      description: "Limpar Filtros",
    },
  ]);

  const filteredSales = salesData.filter((sale) => {
    const matchesSearch =
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.operator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || sale.date === dateFilter;

    const matchesPayment =
      paymentFilter === "todos" || sale.paymentMethod === paymentFilter;

    return matchesSearch && matchesDate && matchesPayment;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;

  const getPaymentIcon = (method) => {
    switch (method) {
      case "dinheiro":
        return <Banknote className="w-4 h-4" />;
      case "cartao":
        return <CreditCard className="w-4 h-4" />;
      case "pix":
        return <QrCode className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPaymentLabel = (method) => {
    switch (method) {
      case "dinheiro":
        return "Dinheiro";
      case "cartao":
        return "Cartão";
      case "pix":
        return "PIX";
      default:
        return method;
    }
  };

  const handlePrint = (sale) => {
    // Aqui você implementaria a lógica de impressão
    alert(`Reimprimindo cupom da venda ${sale.id}`);
  };

  const formatDate = (dateStr) => {
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
                    R$ {totalSales.toFixed(2)}
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
                    {totalTransactions}
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
                    R${" "}
                    {totalTransactions > 0
                      ? (totalSales / totalTransactions).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("");
                    setPaymentFilter("todos");
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
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {filteredSales.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma venda encontrada
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredSales.map((sale) => (
                        <Card key={sale.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="font-mono">
                                  {sale.id}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  {getPaymentIcon(sale.paymentMethod)}
                                  <span className="text-sm text-gray-600">
                                    {getPaymentLabel(sale.paymentMethod)}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Data</p>
                                  <p className="font-medium">
                                    {formatDate(sale.date)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Hora</p>
                                  <p className="font-medium">{sale.time}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Operador</p>
                                  <p className="font-medium">{sale.operator}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Total</p>
                                  <p className="font-bold text-green-600">
                                    R$ {sale.total.toFixed(2)}
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
                                      Detalhes da Venda {sale.id}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-500">
                                          Data/Hora
                                        </p>
                                        <p>
                                          {formatDate(sale.date)} às {sale.time}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">
                                          Operador
                                        </p>
                                        <p>{sale.operator}</p>
                                      </div>
                                    </div>
                                    <Separator />
                                    <div>
                                      <p className="font-medium mb-2">Itens:</p>
                                      <div className="space-y-2">
                                        {sale.items.map((item) => (
                                          <div
                                            key={item.id}
                                            className="flex justify-between text-sm"
                                          >
                                            <span>
                                              {item.quantity}x {item.name}
                                            </span>
                                            <span>
                                              R${" "}
                                              {(
                                                item.price * item.quantity
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>
                                          R$ {sale.subtotal.toFixed(2)}
                                        </span>
                                      </div>
                                      {sale.discount > 0 && (
                                        <div className="flex justify-between text-red-600">
                                          <span>
                                            Desconto ({sale.discount}%):
                                          </span>
                                          <span>
                                            -R${" "}
                                            {(
                                              (sale.subtotal * sale.discount) /
                                              100
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-bold">
                                        <span>Total:</span>
                                        <span>R$ {sale.total.toFixed(2)}</span>
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
                      ))}
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
