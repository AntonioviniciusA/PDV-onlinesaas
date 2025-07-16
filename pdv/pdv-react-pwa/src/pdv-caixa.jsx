import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import { ScrollArea } from "./components/ui/scroll-area";
import {
  ShoppingCart,
  Plus,
  Minus,
  Search,
  CreditCard,
  Banknote,
  Percent,
  Calculator,
  QrCode,
  Shield,
  Scale,
  DollarSign,
  Menu,
  Utensils,
  Gift,
  Building,
} from "lucide-react";
import HistoricoVendas from "./historico-vendas";
import CadastroProdutos from "./cadastro-produtos";
import EtiquetasPreco from "./etiquetas-preco";
import { Badge } from "./components/ui/badge";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { CashPaymentDialog } from "./components/cash-payment-dialog";
import { PixPaymentDialog } from "./components/pix-payment-dialog";
import { CardPaymentDialog } from "./components/card-payment-dialog";
import { MixedPaymentDialog } from "./components/mixed-payment-dialog";
import { WeightInputDialog } from "./components/weight-input-dialog";
import { LoginDialog } from "./components/login-dialog";
import { LabelConfigDialog } from "./components/label-config-dialog";
import { ReceiptConfigDialog } from "./components/receipt-config-dialog";
import { CashManagementDialog } from "./components/cash-management-dialog";
import { ReceiptSelectionDialog } from "./components/receipt-selection-dialog";
import { useOfflineSync } from "./hooks/use-offline-sync";
import { OfflineStatus } from "./components/offline-status";
import { useNavigate } from "react-router-dom";
import PdvNav from "./components/PdvNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import AuthorizationRequest from "./components/AuthorizationRequest";
import beepSound from "./assets/sounds/beep.mp3";

import { initialProducts } from "./data/initialProducts";
import { localUsers } from "./data/localUsers";
import { cupomService } from "./services/cupomServices.js";

export default function PDVCaixa() {
  const { salvarCupom, requestNotificationPermission } = useOfflineSync();
  const [products, setProducts] = useState(initialProducts);

  // Solicitar permissão de notificação ao montar o componente
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcode, setBarcode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tempDiscount, setTempDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [tempDiscountValue, setTempDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("pdv");
  const [selectedCartIndex, setSelectedCartIndex] = useState(-1);
  const [authorizationRequest, setAuthorizationRequest] = useState(null);
  const [authorizationLog, setAuthorizationLog] = useState([]); // eslint-disable-line no-unused-vars
  const [showCashPayment, setShowCashPayment] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [showCardSelection, setShowCardSelection] = useState(false);
  const [showMixedPayment, setShowMixedPayment] = useState(false);
  const [pixPaymentConfirmed, setPixPaymentConfirmed] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState("");
  const [mixedPayments, setMixedPayments] = useState([]);
  const [showProductList, setShowProductList] = useState(false);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [selectedProductForWeight, setSelectedProductForWeight] =
    useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showLabelConfig, setShowLabelConfig] = useState(false);
  const [showReceiptConfig, setShowReceiptConfig] = useState(false);
  const [showCashManagement, setShowCashManagement] = useState(false);
  const [showReceiptSelection, setShowReceiptSelection] = useState(false);
  const [cashAction, setCashAction] = useState("open");
  const [cashSession, setCashSession] = useState(null);
  const [labelTemplate, setLabelTemplate] = useState({
    id: "standard",
    name: "Padrão",
    width: 140,
    height: 100,
    showComparison: true,
    showICMS: true,
    showBarcode: true,
    fontSize: { name: 12, price: 18, comparison: 10, barcode: 8 },
    colors: {
      background: "#ffffff",
      text: "#000000",
      price: "#16a34a",
      comparison: "#2563eb",
    },
  });
  const [receiptConfig, setReceiptConfig] = useState({
    enableFiscalCoupon: true,
    enableReceipt: true,
    defaultType: "fiscal",
    rolePermissions: {
      caixa: { canChoose: false, defaultType: "receipt" },
      fiscal: { canChoose: true, defaultType: "fiscal" },
      supervisor: { canChoose: true, defaultType: "fiscal" },
      gerente: { canChoose: true, defaultType: "both" },
      admin: { canChoose: true, defaultType: "both" },
    },
  });
  const [showNav, setShowNav] = useState(true);
  const [barcodeQty, setBarcodeQty] = useState(1);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const paymentTimeoutRef = useRef();

  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const discountInputRef = useRef(null);
  const discountValueInputRef = useRef(null);
  const searchTimeoutRef = useRef();
  const audioRef = useRef(null);

  useEffect(() => {
    if (authorizationRequest && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, [authorizationRequest]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
  );

  // Auto-hide da lista de produtos após 3 segundos sem pesquisa
  useEffect(() => {
    if (searchTerm.trim()) {
      setShowProductList(true);

      // Limpar timeout anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Definir novo timeout para esconder a lista
      searchTimeoutRef.current = setTimeout(() => {
        setShowProductList(false);
      }, 5000); // 5 segundos
    } else {
      setShowProductList(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const logAuthorization = (supervisor, action, details) => {
    const log = {
      timestamp: new Date().toLocaleString("pt-BR"),
      supervisor,
      action,
      details,
    };
    setAuthorizationLog((prev) => [log, ...prev]);
    console.log("Autorização registrada:", log);
  };

  // Modificar addToCart para aceitar quantidade
  const addToCart = (product, weight, qty = 1) => {
    if (product.requiresWeight && !weight) {
      setSelectedProductForWeight(product);
      setShowWeightDialog(true);
      return;
    }

    const finalWeight = weight || 1;
    const totalPrice = product.requiresWeight
      ? product.price * finalWeight
      : product.price * qty;

    setCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) =>
          item.id === product.id &&
          (!product.requiresWeight || item.weight === finalWeight)
      );

      if (existingItemIndex >= 0 && !product.requiresWeight) {
        // Para produtos normais, aumentar quantidade
        return prev.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + qty,
                totalPrice: item.totalPrice + product.price * qty,
              }
            : item
        );
      } else {
        // Para produtos por peso ou novos produtos
        const newItem = {
          ...product,
          quantity: qty,
          weight: finalWeight,
          totalPrice: totalPrice,
        };
        return [...prev, newItem];
      }
    });

    // Esconder lista após adicionar produto
    setShowProductList(false);
    setSearchTerm("");
  };

  const handleWeightConfirm = (weight) => {
    if (selectedProductForWeight) {
      addToCart(selectedProductForWeight, weight);
      setSelectedProductForWeight(null);
    }
  };

  const updateQuantity = (id, quantity, weight) => {
    if (quantity <= 0) {
      const item = cart.find(
        (item) => item.id === id && (!weight || item.weight === weight)
      );
      requestAuthorization({
        type: "remove-item",
        title: "Remover Item",
        description: `Remover "${item?.name}" do carrinho. Esta ação requer autorização do fiscal.`,
        action: () => removeFromCartDirect(id, weight),
        itemId: id,
      });
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id && (!weight || item.weight === weight)) {
          const newTotalPrice = item.requiresWeight
            ? item.price * (item.weight || 1) * quantity
            : item.price * quantity;
          return { ...item, quantity, totalPrice: newTotalPrice };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id, weight) => {
    const item = cart.find(
      (item) => item.id === id && (!weight || item.weight === weight)
    );
    requestAuthorization({
      type: "remove-item",
      title: "Remover Item",
      description: `Remover "${item?.name}" do carrinho. Esta ação requer autorização do fiscal.`,
      action: () => removeFromCartDirect(id, weight),
      itemId: id,
    });
  };

  const removeFromCartDirect = (id, weight) => {
    const item = cart.find(
      (item) => item.id === id && (!weight || item.weight === weight)
    );
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === id && (!weight || item.weight === weight))
      )
    );
    if (selectedCartIndex >= 0) {
      setSelectedCartIndex(-1);
    }
    return item?.name || "Item";
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Calcular desconto baseado no tipo
  const discountAmount =
    discountType === "percentage"
      ? (subtotal * discount) / 100
      : Math.min(discountValue, subtotal); // Não pode ser maior que o subtotal

  const total = subtotal - discountAmount;

  const handleBarcodeSearch = () => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product, undefined, barcodeQty);
      setBarcode("");
      setBarcodeQty(1);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
      setSearchTerm("");
    }
  };

  const requestAuthorization = (request) => {
    setAuthorizationRequest(request);
  };

  const handleAuthorization = (supervisor) => {
    if (authorizationRequest) {
      let details = "";
      let actionName = "";

      if (authorizationRequest.type === "discount") {
        actionName = "Aplicar Desconto";
        if (discountType === "percentage") {
          details = `Desconto de ${tempDiscount}% aplicado. Valor: R$ ${(
            (subtotal * tempDiscount) /
            100
          ).toFixed(2)}`;
        } else {
          details = `Desconto de R$ ${tempDiscountValue.toFixed(2)} aplicado`;
        }
      } else if (authorizationRequest.type === "clear-cart") {
        actionName = "Limpar Carrinho";
        details = `Carrinho com ${
          cart.length
        } itens limpo. Valor total: R$ ${total.toFixed(2)}`;
      } else if (authorizationRequest.type === "remove-item") {
        const itemName = removeFromCartDirect(authorizationRequest.itemId);
        actionName = "Remover Item";
        details = `Item "${itemName}" removido do carrinho`;
        setAuthorizationRequest(null);
        logAuthorization(supervisor, actionName, details);
        return;
      }

      authorizationRequest.action();
      logAuthorization(supervisor, actionName, details);
      setAuthorizationRequest(null);
    }
  };

  const clearCart = () => {
    if (cart.length === 0) return;

    requestAuthorization({
      type: "clear-cart",
      title: "Limpar Carrinho",
      description: `Limpar carrinho com ${
        cart.length
      } itens (Total: R$ ${total.toFixed(
        2
      )}). Esta ação requer autorização do fiscal.`,
      action: () => clearCartDirect(),
    });
  };

  const clearCartDirect = () => {
    setCart([]);
    setDiscount(0);
    setTempDiscount(0);
    setDiscountValue(0);
    setTempDiscountValue(0);
    setPaymentMethod(null);
    setSelectedCartIndex(-1);
    setPixPaymentConfirmed(false);
    setSelectedCardType("");
    setMixedPayments([]);
  };

  const handleDiscountChange = (value, type) => {
    if (type === "percentage") {
      setTempDiscount(value);
      if (value > discount) {
        requestAuthorization({
          type: "discount",
          title: "Aplicar Desconto",
          description: `Aplicar desconto de ${value}% (R$ ${(
            (subtotal * value) /
            100
          ).toFixed(2)}). Esta ação requer autorização do fiscal.`,
          action: () => applyDiscount(value, type),
        });
      } else {
        setDiscount(value);
      }
    } else {
      setTempDiscountValue(value);
      if (value > discountValue) {
        requestAuthorization({
          type: "discount",
          title: "Aplicar Desconto",
          description: `Aplicar desconto de R$ ${value.toFixed(
            2
          )}. Esta ação requer autorização do fiscal.`,
          action: () => applyDiscount(value, type),
        });
      } else {
        setDiscountValue(value);
      }
    }
  };

  const applyDiscount = (value, type) => {
    if (type === "percentage") {
      setDiscount(value);
    } else {
      setDiscountValue(value);
    }
  };

  const hasPermission = (module, action) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;

    const permission = currentUser.permissions.find((p) => p.module === module);
    return (
      permission?.actions.includes(action) || permission?.actions.includes("*")
    );
  };

  const completeSale = async (receivedAmount, changeAmount, receiptType) => {
    if (cart.length === 0) {
      alert("Não é possível finalizar venda com carrinho vazio!");
      return;
    }

    if (total <= 0) {
      alert("Não é possível finalizar venda com valor zero!");
      return;
    }

    if (!receiptType && currentUser) {
      const userPermissions = receiptConfig.rolePermissions[currentUser.role];
      if (userPermissions?.canChoose) {
        setShowReceiptSelection(true);
        return;
      } else {
        receiptType = userPermissions?.defaultType || "receipt";
      }
    }

    let message = `Venda finalizada!\nTotal: R$ ${total.toFixed(2)}`;

    if (mixedPayments.length > 0) {
      message += `\nPagamento Misto:`;
      mixedPayments.forEach((payment) => {
        message += `\n- ${payment.name}: R$ ${payment.amount.toFixed(2)}`;
        if (payment.type === "pix") {
          message += " (PIX Confirmado)";
        }
      });
    } else if (paymentMethod) {
      let paymentName = paymentMethod;
      if (paymentMethod === "cartao" && selectedCardType) {
        paymentName = `Cartão ${selectedCardType}`;
      }
      message += `\nPagamento: ${paymentName}`;
    }

    if (
      paymentMethod === "dinheiro" &&
      receivedAmount &&
      changeAmount !== undefined
    ) {
      message += `\nRecebido: R$ ${receivedAmount.toFixed(2)}`;
      if (changeAmount > 0) {
        message += `\nTroco: R$ ${changeAmount.toFixed(2)}`;
      } else {
        message += `\nTroco: Valor exato`;
      }
    }

    // Preparar dados do cupom para salvamento
    const cupomData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      items: cart,
      total: total,
      discount: discount,
      discountType: discountType,
      discountValue: discountValue,
      paymentMethod: paymentMethod,
      selectedCardType: selectedCardType,
      mixedPayments: mixedPayments,
      receivedAmount: receivedAmount,
      changeAmount: changeAmount,
      receiptType: receiptType,
      user: currentUser,
      pixPaymentConfirmed: pixPaymentConfirmed,
    };

    try {
      if (receiptType === "fiscal") {
        await cupomService.printThermalCupom(cupomData);
      } else {
        await cupomService.printThermalRecibo(cupomData);
      }
    } catch (error) {
      console.error("Erro ao salvar cupom:", error);
      message += "\n\n❌ Erro ao salvar cupom.";
    }

    alert(message);
    clearCartDirect();
  };

  const finalizeSale = () => {
    // ADICIONAR verificações antes de finalizar
    if (cart.length === 0) {
      alert("Adicione produtos ao carrinho antes de finalizar a venda!");
      return;
    }

    if (total <= 0) {
      alert("O valor total deve ser maior que zero!");
      return;
    }

    if (!paymentMethod && mixedPayments.length === 0) {
      alert("Selecione uma forma de pagamento!");
      return;
    }

    if (paymentMethod === "dinheiro") {
      setShowCashPayment(true);
      return;
    }

    if (paymentMethod === "pix") {
      if (!pixPaymentConfirmed) {
        setShowPixPayment(true);
        return;
      }
    }

    if (paymentMethod === "cartao" && !selectedCardType) {
      setShowCardSelection(true);
      return;
    }

    // Para cartão e PIX confirmado, finalizar diretamente
    completeSale();
  };

  const focusSearchInput = () => {
    searchInputRef.current?.focus();
  };

  const focusBarcodeInput = () => {
    barcodeInputRef.current?.focus();
  };

  const removeSelectedCartItem = () => {
    if (selectedCartIndex >= 0 && selectedCartIndex < cart.length) {
      const item = cart[selectedCartIndex];
      removeFromCart(item.id, item.weight);
    }
  };

  const increaseSelectedCartItem = () => {
    if (selectedCartIndex >= 0 && selectedCartIndex < cart.length) {
      const item = cart[selectedCartIndex];
      updateQuantity(item.id, item.quantity + 1, item.weight);
    }
  };

  const decreaseSelectedCartItem = () => {
    if (selectedCartIndex >= 0 && selectedCartIndex < cart.length) {
      const item = cart[selectedCartIndex];
      updateQuantity(item.id, item.quantity - 1, item.weight);
    }
  };

  const navigateCart = (direction) => {
    if (cart.length === 0) return;

    if (direction === "up") {
      setSelectedCartIndex((prev) => (prev <= 0 ? cart.length - 1 : prev - 1));
    } else {
      setSelectedCartIndex((prev) => (prev >= cart.length - 1 ? 0 : prev + 1));
    }
  };

  const navigateToScreen = (screen) => {
    if (screen === "cadastro" && !hasPermission("products", "manage")) {
      alert(
        "Acesso negado. Você não tem permissão para acessar o cadastro de produtos."
      );
      return;
    }
    if (screen === "etiquetas" && !hasPermission("labels", "config")) {
      alert("Acesso negado. Você não tem permissão para acessar as etiquetas.");
      return;
    }
    setCurrentScreen(screen);
  };

  // Atalhos para abrir modais
  const openDiscount = useCallback(() => setShowDiscount(true), []);
  const openPayment = useCallback((method) => {
    setShowPayment(true);
    if (method) setPaymentMethod(method);
    if (method === "cartao") setShowCardSelection(true);
  }, []);

  const openMixedPayment = () => {
    setShowMixedPayment(true);
  };

  // Função para selecionar método de pagamento e fechar painel após 5s
  const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setShowCardSelection(false);
    if (method === "cartao") setShowCardSelection(true);
    if (showPayment) {
      if (paymentTimeoutRef.current) clearTimeout(paymentTimeoutRef.current);
      paymentTimeoutRef.current = setTimeout(() => setShowPayment(false), 5000);
    }
  };

  // Definir atalhos de teclado
  const shortcuts = useKeyboardShortcuts([
    {
      key: "F1",
      action: finalizeSale,
      description: "Finalizar Venda",
    },
    {
      key: "F2",
      action: clearCart,
      description: "Limpar Carrinho",
    },
    {
      key: "F3",
      action: () => openPayment("dinheiro"),
      description: "Pagamento em Dinheiro",
    },
    {
      key: "F4",
      action: () => openPayment("cartao"),
      description: "Pagamento no Cartão",
    },
    {
      key: "F5",
      action: () => openPayment("pix"),
      description: "Pagamento via PIX",
    },
    {
      key: "F6",
      action: () => setCurrentScreen("historico"),
      description: "Histórico de Vendas",
    },
    {
      key: "F7",
      action: openDiscount,
      description: "Abrir desconto",
    },
    {
      key: "F8",
      action: focusSearchInput,
      description: "Buscar Produto",
    },
    {
      key: "F9",
      action: focusBarcodeInput,
      description: "Código de Barras",
    },
    {
      key: "F10",
      action: handleBarcodeSearch,
      description: "Adicionar por Código",
    },
    {
      key: "+",
      action: () => setBarcodeQty((q) => Math.min(q + 1, 99)),
      description: "Aumentar quantidade do produto a adicionar",
    },
    {
      key: "-",
      action: () => setBarcodeQty((q) => Math.max(q - 1, 1)),
      description: "Diminuir quantidade do produto a adicionar",
    },
    {
      key: "F11",
      action: () => setShowNav(true),
      description: "Abrir menu",
    },
    {
      key: "Escape",
      action: () => setShowNav(false),
      description: "Fechar menu",
    },
    {
      key: "Delete",
      action: removeSelectedCartItem,
      description: "Remover Item Selecionado",
    },
    {
      key: "ArrowUp",
      action: () => navigateCart("up"),
      description: "Navegar Carrinho (Cima)",
    },
    {
      key: "ArrowDown",
      action: () => navigateCart("down"),
      description: "Navegar Carrinho (Baixo)",
    },
    {
      key: "+",
      action: increaseSelectedCartItem,
      description: "Aumentar Quantidade do item selecionado",
      ctrlKey: true,
    },
    {
      key: "-",
      action: decreaseSelectedCartItem,
      description: "Diminuir Quantidade do item selecionado",
      ctrlKey: true,
    },
    {
      key: "F12",
      action: openMixedPayment,
      description: "Abrir Pagamento Misto",
    },
  ]);

  const navigate = useNavigate();

  const cardTypes = [
    {
      id: "credito",
      name: "Crédito",
      icon: CreditCard,
      color: "text-blue-600",
    },
    { id: "debito", name: "Débito", icon: CreditCard, color: "text-green-600" },
    {
      id: "alimentacao",
      name: "Alimentação",
      icon: Utensils,
      color: "text-orange-600",
    },
    { id: "refeicao", name: "Refeição", icon: Utensils, color: "text-red-600" },
    {
      id: "vale-presente",
      name: "Vale Presente",
      icon: Gift,
      color: "text-purple-600",
    },
    {
      id: "corporativo",
      name: "Corporativo",
      icon: Building,
      color: "text-gray-600",
    },
  ];

  // Renderizar telas diferentes
  if (currentScreen === "historico") {
    return <HistoricoVendas onBack={() => setCurrentScreen("pdv")} />;
  }

  if (currentScreen === "cadastro") {
    return (
      <CadastroProdutos
        onBack={() => setCurrentScreen("pdv")}
        products={products}
        onUpdateProducts={setProducts}
      />
    );
  }

  if (currentScreen === "etiquetas") {
    return (
      <EtiquetasPreco
        onBack={() => setCurrentScreen("pdv")}
        products={products}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Botão flutuante para abrir o nav */}
      {!showNav && (
        <button
          className="fixed top-7 left-1 z-50 bg-white border rounded-full shadow p-2 hover:bg-gray-100 transition"
          onClick={() => setShowNav(true)}
          title="Abrir menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      )}
      {/* Nav principal */}
      {showNav && (
        <PdvNav
          shortcuts={shortcuts}
          hasPermission={hasPermission}
          cashSession={cashSession}
          setShowLabelConfig={setShowLabelConfig}
          setShowCashManagement={setShowCashManagement}
          setCashAction={setCashAction}
          navigate={navigate}
          onCloseNav={() => setShowNav(false)}
        />
      )}
      {/* Status Offline */}
      <OfflineStatus />

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="max-w-full m-2 justify-center h-full overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Produtos */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader className="flex-shrink-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Search className="w-5 h-5" />
                    Produtos
                  </CardTitle>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="search" className="text-sm">
                        Buscar produto (F8)
                      </Label>
                      <Input
                        ref={searchInputRef}
                        id="search"
                        placeholder="Nome do produto ou código de barras..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="mt-1"
                        autoComplete="off"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        ref={barcodeInputRef}
                        placeholder="Código de barras (F9)"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleBarcodeSearch()
                        }
                        className="flex-1"
                        autoComplete="off"
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setBarcodeQty((q) => Math.max(q - 1, 1))
                          }
                          className="px-2"
                        >
                          -
                        </Button>
                        <span className="w-6 text-center font-bold">
                          {barcodeQty}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setBarcodeQty((q) => Math.min(q + 1, 99))
                          }
                          className="px-2"
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        onClick={handleBarcodeSearch}
                        title="F10"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col min-h-0 relative">
                  {/* Lista de Produtos Filtrados - Overlay */}
                  {showProductList && searchTerm && (
                    <div className="absolute inset-0 z-10 bg-white border rounded-lg shadow-lg">
                      <ScrollArea className="h-full p-2">
                        {filteredProducts.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">
                            Nenhum produto encontrado
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {filteredProducts.map((product) => (
                              <Card
                                key={product.id}
                                className="cursor-pointer hover:shadow-md transition-shadow p-3"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-sm">
                                        {product.name}
                                      </h3>
                                      {product.requiresWeight && (
                                        <Scale
                                          className="w-3 h-3 text-orange-600"
                                          title="Produto por peso"
                                        />
                                      )}
                                      {product.icms && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          ICMS {product.icms}%
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {product.category}
                                      </Badge>
                                      <span className="text-xs text-gray-500">
                                        {product.barcode}
                                      </span>
                                      <span className="text-xs text-blue-600">
                                        {product.requiresWeight
                                          ? `R$ ${product.price.toFixed(2)}/kg`
                                          : `R$ ${product.price.toFixed(2)}/${
                                              product.unit
                                            }`}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Button
                                      onClick={() => addToCart(product)}
                                      size="sm"
                                      className="mt-1"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}

                  {/* Logo da Empresa */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 max-w-md">
                      <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">LOGO</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Sua Empresa
                      </h3>
                      <p className="text-sm text-gray-500">
                        Use F8 para buscar produtos ou F9 para código de barras
                      </p>
                    </div>
                  </div>

                  {/* QR Code PIX - quando necessário */}
                  {paymentMethod === "pix" && total > 0 && (
                    <div className="absolute bottom-4 right-4 p-4 border rounded-lg bg-white shadow-lg">
                      <h3 className="font-semibold mb-3 text-center text-sm">
                        QR Code PIX
                      </h3>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <p className="text-xs">QR Code PIX</p>
                            <p className="text-xs mt-1">
                              R$ {total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 text-center max-w-32">
                          Escaneie para pagar
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Carrinho */}
            <div className="flex flex-col min-h-0">
              <Card className="flex-1 flex flex-col min-h-0 w-full">
                <CardHeader className="flex-shrink-0 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingCart className="w-5 h-5" />
                    Carrinho ({cart.length} itens)
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col min-h-0 space-y-3">
                  {/* Lista do Carrinho com Scroll */}
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      {cart.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-gray-500 text-center">
                            Carrinho vazio
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 pr-2">
                          {cart.map((item, index) => (
                            <div
                              key={`${item.id}-${item.weight || "unit"}`}
                              className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
                                selectedCartIndex === index
                                  ? "bg-blue-50 border-blue-300"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => setSelectedCartIndex(index)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-sm truncate">
                                    {item.name}
                                  </p>
                                  {item.requiresWeight && (
                                    <Scale className="w-3 h-3 text-orange-600" />
                                  )}
                                  {item.icms && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      ICMS {item.icms}%
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.requiresWeight ? (
                                    <span>
                                      {item.weight?.toFixed(3)} kg × R${" "}
                                      {item.price.toFixed(2)}/kg
                                    </span>
                                  ) : (
                                    <span>
                                      R$ {item.price.toFixed(2)}/{item.unit}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-semibold text-green-600">
                                  Total: R$ {item.totalPrice.toFixed(2)}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(
                                      item.id,
                                      item.quantity - 1,
                                      item.weight
                                    );
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-6 text-center text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(
                                      item.id,
                                      item.quantity + 1,
                                      item.weight
                                    );
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCart(item.id, item.weight);
                                }}
                                title="Requer cartão de autorização"
                                className="h-6 w-6 p-0"
                              >
                                <Shield className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  <Separator />

                  {/* Totais */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        R${" "}
                        {cart
                          .reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>
                          Desconto (
                          {discountType === "percentage"
                            ? `${discount}%`
                            : `R$ ${discountValue.toFixed(2)}`}
                          ):
                        </span>
                        <span>-R$ {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total:</span>
                      <span className="text-green-600">
                        R$ {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Botão para abrir desconto */}
                  <div className="flex flex-row gap-4">
                    <Button
                      variant="outline"
                      className="w-full h-8 text-xs bg-transparent"
                      onClick={openDiscount}
                      title="F7"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Desconto (F7)
                    </Button>

                    {/* Botão para abrir método de pagamento */}
                    <Button
                      variant="outline"
                      className="w-full h-8 text-xs bg-transparent"
                      onClick={() => setShowPayment(true)}
                      title="F3/F4/F5"
                    >
                      {paymentMethod === "dinheiro" && (
                        <>
                          <Banknote className="w-3 h-3 mr-1" />
                          Dinheiro
                        </>
                      )}
                      {paymentMethod === "pix" && (
                        <>
                          <QrCode className="w-3 h-3 mr-1" />
                          PIX
                        </>
                      )}
                      {paymentMethod === "cartao" &&
                        selectedCardType &&
                        (() => {
                          const card = cardTypes.find(
                            (c) => c.id === selectedCardType
                          );
                          if (card) {
                            const Icon = card.icon;
                            return (
                              <>
                                <Icon
                                  className={`w-3 h-3 ${card.color} mr-1`}
                                />
                                {card.name}
                              </>
                            );
                          }
                          return (
                            <>
                              <CreditCard className="w-3 h-3 mr-1" />
                              Cartão
                            </>
                          );
                        })()}
                      {(!paymentMethod ||
                        (paymentMethod === "cartao" && !selectedCardType)) && (
                        <>
                          <DollarSign className="w-3 h-3 mr-1" />
                          Pagamento (F3/F4/F5)
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Exibir método de pagamento selecionado */}
                  {showPayment && paymentMethod && (
                    <div className="space-y-2 mt-2">
                      <Label className="text-sm">Forma de Pagamento</Label>
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          variant={
                            paymentMethod === "dinheiro" ? "default" : "outline"
                          }
                          onClick={() => selectPaymentMethod("dinheiro")}
                          className="flex items-center gap-1 text-xs h-8"
                          title="F3"
                        >
                          <Banknote className="w-3 h-3" />
                          <span className="hidden sm:inline">Dinheiro</span>
                          <span className="sm:hidden">$</span>
                        </Button>
                        <Button
                          variant={
                            paymentMethod === "cartao" ? "default" : "outline"
                          }
                          onClick={() => selectPaymentMethod("cartao")}
                          className="flex items-center gap-1 text-xs h-8"
                          title="F4"
                        >
                          {paymentMethod === "cartao" &&
                            selectedCardType &&
                            (() => {
                              const card = cardTypes.find(
                                (c) => c.id === selectedCardType
                              );
                              if (card) {
                                const Icon = card.icon;
                                return (
                                  <>
                                    <Icon className={`w-3 h-3 ${card.color}`} />
                                    {card.name}
                                  </>
                                );
                              }
                              return (
                                <>
                                  <CreditCard className="w-3 h-3" />
                                  Cartão
                                </>
                              );
                            })()}
                          <span className="hidden sm:inline">
                            {paymentMethod === "cartao" && selectedCardType
                              ? ""
                              : "Cartão"}
                          </span>
                          <span className="sm:hidden">💳</span>
                        </Button>
                        <Button
                          variant={
                            paymentMethod === "pix" ? "default" : "outline"
                          }
                          onClick={() => selectPaymentMethod("pix")}
                          className="flex items-center gap-1 text-xs h-8"
                          title="F5"
                        >
                          <QrCode className="w-3 h-3" />
                          PIX
                        </Button>
                      </div>
                      {/* Botão Pagamento Misto */}
                      <Button
                        variant="outline"
                        onClick={openMixedPayment}
                        className="w-full h-8 text-xs bg-transparent mt-2"
                        title="F12"
                      >
                        <Calculator className="w-3 h-3 mr-1" />
                        Pagamento Misto (F12)
                      </Button>
                    </div>
                  )}

                  <Separator />

                  {/* Ações */}
                  <div className="space-y-2">
                    <Button
                      onClick={finalizeSale}
                      disabled={
                        cart.length === 0 ||
                        total <= 0 ||
                        (!paymentMethod && mixedPayments.length === 0) ||
                        (paymentMethod === "pix" && !pixPaymentConfirmed)
                      }
                      className="w-full h-10"
                      title="F1"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Finalizar Venda (F1)
                    </Button>
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="w-full h-8 text-xs bg-transparent"
                      title="F2"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Limpar Carrinho (F2)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AuthorizationRequest
        open={!!authorizationRequest}
        onOpenChange={(open) => !open && setAuthorizationRequest(null)}
        title={authorizationRequest?.title || ""}
        description={authorizationRequest?.description || ""}
        users={localUsers}
        onAuthorize={(user, password) => {
          // Simulação: senha correta
          if (user.senha === password) {
            handleAuthorization(user);
            setAuthorizationRequest(null);
          } else {
            alert("Senha/cartão incorreto!");
          }
        }}
      />

      <CashPaymentDialog
        open={showCashPayment}
        onOpenChange={setShowCashPayment}
        totalAmount={total}
        onConfirm={(received, change) => completeSale(received, change)}
      />

      <PixPaymentDialog
        open={showPixPayment}
        onOpenChange={setShowPixPayment}
        amount={total}
        onPaymentConfirmed={() => setPixPaymentConfirmed(true)}
      />

      <CardPaymentDialog
        open={showCardSelection}
        onOpenChange={setShowCardSelection}
        onSelectCardType={setSelectedCardType}
      />

      <MixedPaymentDialog
        open={showMixedPayment}
        onOpenChange={setShowMixedPayment}
        totalAmount={total}
        onConfirm={(payments) => {
          setMixedPayments(payments);
          setPaymentMethod(null);
        }}
        onRequestAuthorization={requestAuthorization}
      />

      <WeightInputDialog
        open={showWeightDialog}
        onOpenChange={setShowWeightDialog}
        product={selectedProductForWeight}
        onConfirm={handleWeightConfirm}
      />

      {/* Login Dialog */}
      <LoginDialog
        open={showLogin}
        onLogin={(user) => {
          setCurrentUser(user);
          setShowLogin(false);
        }}
      />

      {/* Label Config Dialog */}
      <LabelConfigDialog
        open={showLabelConfig}
        onOpenChange={setShowLabelConfig}
        currentTemplate={labelTemplate}
        onSave={setLabelTemplate}
      />

      {/* Receipt Config Dialog */}
      <ReceiptConfigDialog
        open={showReceiptConfig}
        onOpenChange={setShowReceiptConfig}
        config={receiptConfig}
        onSave={setReceiptConfig}
      />

      {/* Cash Management Dialog */}
      <CashManagementDialog
        open={showCashManagement}
        onOpenChange={setShowCashManagement}
        action={cashAction}
        currentSession={cashSession}
        onConfirm={(amount) => {
          if (cashAction === "open") {
            setCashSession({
              id: Date.now().toString(),
              openedBy: currentUser?.name || "Usuário",
              openedAt: new Date().toISOString(),
              initialAmount: amount,
              totalSales: 0,
              totalTransactions: 0,
              status: "open",
            });
          } else {
            setCashSession(null);
          }
          setShowCashManagement(false);
        }}
        userName={currentUser?.name || "Usuário"}
      />

      {/* Receipt Selection Dialog */}
      <ReceiptSelectionDialog
        open={showReceiptSelection}
        onOpenChange={setShowReceiptSelection}
        onSelect={(type) => completeSale(undefined, undefined, type)}
        canChoose={
          currentUser
            ? receiptConfig.rolePermissions[currentUser.role]?.canChoose ||
              false
            : false
        }
        defaultType={
          currentUser
            ? receiptConfig.rolePermissions[currentUser.role]?.defaultType ||
              "receipt"
            : "receipt"
        }
      />

      {/* Modal de Desconto */}
      <Dialog
        open={showDiscount}
        onOpenChange={(open) => {
          setShowDiscount(open);
          if (!open) {
            if (discountType === "percentage" && tempDiscount !== discount) {
              handleDiscountChange(tempDiscount, "percentage");
            } else if (
              discountType === "value" &&
              tempDiscountValue !== discountValue
            ) {
              handleDiscountChange(tempDiscountValue, "value");
            }
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Aplicar Desconto
            </DialogTitle>
          </DialogHeader>
          {/* Conteúdo do desconto (igual ao antigo, mas aqui) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {discountType === "percentage" ? (
                <Percent className="w-4 h-4" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              <Label className="text-sm">Desconto</Label>
              <Shield
                className="w-4 h-4 text-orange-600"
                title="Requer cartão de autorização"
              />
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={discountType === "percentage" ? "default" : "outline"}
                onClick={() => setDiscountType("percentage")}
                className="flex-1 h-6 text-xs"
              >
                <Percent className="w-3 h-3 mr-1" />%
              </Button>
              <Button
                size="sm"
                variant={discountType === "value" ? "default" : "outline"}
                onClick={() => setDiscountType("value")}
                className="flex-1 h-6 text-xs"
              >
                <DollarSign className="w-3 h-3 mr-1" />
                R$
              </Button>
            </div>
            {discountType === "percentage" ? (
              <Input
                ref={discountInputRef}
                type="number"
                min="0"
                max="100"
                value={tempDiscount}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setTempDiscount(value);
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (value !== discount) {
                    handleDiscountChange(value, "percentage");
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const value = Number(e.target.value);
                    if (value !== discount) {
                      handleDiscountChange(value, "percentage");
                    }
                  }
                }}
                placeholder="0"
                className="h-8"
                autoComplete="off"
              />
            ) : (
              <Input
                ref={discountValueInputRef}
                type="number"
                min="0"
                max={subtotal}
                step="0.01"
                value={tempDiscountValue}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setTempDiscountValue(value);
                }}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (value !== discountValue) {
                    handleDiscountChange(value, "value");
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const value = Number(e.target.value);
                    if (value !== discountValue) {
                      handleDiscountChange(value, "value");
                    }
                  }
                }}
                placeholder="0,00"
                className="h-8"
                autoComplete="off"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <audio ref={audioRef} src={beepSound} preload="auto" />
      {/* Exibe os dados de usuários e produtos locais para exemplo */}
    </div>
  );
}
