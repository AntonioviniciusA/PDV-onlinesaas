"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  History,
  Shield,
  Scale,
  DollarSign,
  Package,
  Tag,
  Settings,
} from "lucide-react"
import HistoricoVendas from "./historico-vendas"
import CadastroProdutos from "./cadastro-produtos"
import EtiquetasPreco from "./etiquetas-preco"
import { Badge } from "@/components/ui/badge"
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts"
import { KeyboardShortcutsHelp } from "./components/keyboard-shortcuts-help"
import { AuthorizationDialog } from "./components/authorization-dialog"
import { CashPaymentDialog } from "./components/cash-payment-dialog"
import { PixPaymentDialog } from "./components/pix-payment-dialog"
import { CardPaymentDialog } from "./components/card-payment-dialog"
import { MixedPaymentDialog } from "./components/mixed-payment-dialog"
import { WeightInputDialog } from "./components/weight-input-dialog"
import { LoginDialog } from "./components/login-dialog"
import { LabelConfigDialog } from "./components/label-config-dialog"
import { ReceiptConfigDialog } from "./components/receipt-config-dialog"
import { CashManagementDialog } from "./components/cash-management-dialog"
import { ReceiptSelectionDialog } from "./components/receipt-selection-dialog"
import type { User } from "./types/user"

interface Product {
  id: string
  name: string
  price: number
  category: string
  barcode: string
  requiresWeight?: boolean
  unit?: string
  // Novos campos
  icms?: number
  quantity?: number
  measureUnit?: string
}

interface CartItem extends Product {
  quantity: number
  weight?: number
  totalPrice: number
}

interface AuthorizationRequest {
  type: "discount" | "clear-cart" | "remove-item"
  title: string
  description: string
  action: () => void
  itemId?: string
}

interface AuthorizationLog {
  timestamp: string
  supervisor: string
  action: string
  details: string
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Coca-Cola 350ml",
    price: 4.5,
    category: "Bebidas",
    barcode: "7894900011517",
    unit: "un",
    icms: 18,
    quantity: 350,
    measureUnit: "ml",
  },
  {
    id: "2",
    name: "Pão Francês",
    price: 8.9,
    category: "Padaria",
    barcode: "2000000000001",
    requiresWeight: true,
    unit: "kg",
    icms: 7,
  },
  {
    id: "3",
    name: "Leite Integral 1L",
    price: 5.2,
    category: "Laticínios",
    barcode: "7891000100103",
    unit: "un",
    icms: 12,
    quantity: 1,
    measureUnit: "l",
  },
  {
    id: "4",
    name: "Arroz Branco 5kg",
    price: 22.9,
    category: "Grãos",
    barcode: "7896036098004",
    unit: "un",
    icms: 7,
    quantity: 5,
    measureUnit: "kg",
  },
  {
    id: "5",
    name: "Feijão Preto",
    price: 7.8,
    category: "Grãos",
    barcode: "7896036098011",
    requiresWeight: true,
    unit: "kg",
    icms: 7,
  },
  {
    id: "6",
    name: "Açúcar Cristal",
    price: 4.2,
    category: "Açúcar",
    barcode: "7896036098028",
    requiresWeight: true,
    unit: "kg",
    icms: 7,
  },
  {
    id: "7",
    name: "Óleo de Soja 900ml",
    price: 6.9,
    category: "Óleos",
    barcode: "7896036098035",
    unit: "un",
    icms: 18,
    quantity: 900,
    measureUnit: "ml",
  },
  {
    id: "8",
    name: "Macarrão Espaguete",
    price: 3.8,
    category: "Massas",
    barcode: "7896036098042",
    unit: "un",
    icms: 7,
    quantity: 500,
    measureUnit: "g",
  },
  {
    id: "9",
    name: "Banana Prata",
    price: 5.5,
    category: "Frutas",
    barcode: "2000000000002",
    requiresWeight: true,
    unit: "kg",
    icms: 7,
  },
  {
    id: "10",
    name: "Tomate",
    price: 8.2,
    category: "Verduras",
    barcode: "2000000000003",
    requiresWeight: true,
    unit: "kg",
    icms: 7,
  },
  {
    id: "11",
    name: "Carne Moída",
    price: 32.9,
    category: "Carnes",
    barcode: "2000000000004",
    requiresWeight: true,
    unit: "kg",
    icms: 7,
  },
]

export default function PDVCaixa() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [barcode, setBarcode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [tempDiscount, setTempDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<"percentage" | "value">("percentage")
  const [discountValue, setDiscountValue] = useState(0)
  const [tempDiscountValue, setTempDiscountValue] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "cartao" | "pix" | null>(null)
  const [currentScreen, setCurrentScreen] = useState<"pdv" | "historico" | "cadastro" | "etiquetas">("pdv")
  const [selectedCartIndex, setSelectedCartIndex] = useState<number>(-1)
  const [authorizationRequest, setAuthorizationRequest] = useState<AuthorizationRequest | null>(null)
  const [authorizationLog, setAuthorizationLog] = useState<AuthorizationLog[]>([])
  const [showCashPayment, setShowCashPayment] = useState(false)
  const [showPixPayment, setShowPixPayment] = useState(false)
  const [showCardSelection, setShowCardSelection] = useState(false)
  const [showMixedPayment, setShowMixedPayment] = useState(false)
  const [pixPaymentConfirmed, setPixPaymentConfirmed] = useState(false)
  const [selectedCardType, setSelectedCardType] = useState("")
  const [mixedPayments, setMixedPayments] = useState<any[]>([])
  const [showProductList, setShowProductList] = useState(false)
  const [showWeightDialog, setShowWeightDialog] = useState(false)
  const [selectedProductForWeight, setSelectedProductForWeight] = useState<Product | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(true)
  const [showLabelConfig, setShowLabelConfig] = useState(false)
  const [showReceiptConfig, setShowReceiptConfig] = useState(false)
  const [showCashManagement, setShowCashManagement] = useState(false)
  const [showReceiptSelection, setShowReceiptSelection] = useState(false)
  const [cashAction, setCashAction] = useState<"open" | "close">("open")
  const [cashSession, setCashSession] = useState<any>(null)
  const [labelTemplate, setLabelTemplate] = useState({
    id: "standard",
    name: "Padrão",
    width: 140,
    height: 100,
    showComparison: true,
    showICMS: true,
    showBarcode: true,
    fontSize: { name: 12, price: 18, comparison: 10, barcode: 8 },
    colors: { background: "#ffffff", text: "#000000", price: "#16a34a", comparison: "#2563eb" },
  })
  const [receiptConfig, setReceiptConfig] = useState({
    enableFiscalCoupon: true,
    enableReceipt: true,
    defaultType: "fiscal" as const,
    rolePermissions: {
      caixa: { canChoose: false, defaultType: "receipt" as const },
      fiscal: { canChoose: true, defaultType: "fiscal" as const },
      supervisor: { canChoose: true, defaultType: "fiscal" as const },
      gerente: { canChoose: true, defaultType: "both" as const },
      admin: { canChoose: true, defaultType: "both" as const },
    },
  })

  const searchInputRef = useRef<HTMLInputElement>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const discountInputRef = useRef<HTMLInputElement>(null)
  const discountValueInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm),
  )

  // Auto-hide da lista de produtos após 3 segundos sem pesquisa
  useEffect(() => {
    if (searchTerm.trim()) {
      setShowProductList(true)

      // Limpar timeout anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      // Definir novo timeout para esconder a lista
      searchTimeoutRef.current = setTimeout(() => {
        setShowProductList(false)
      }, 5000) // 5 segundos
    } else {
      setShowProductList(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  const logAuthorization = (supervisor: string, action: string, details: string) => {
    const log: AuthorizationLog = {
      timestamp: new Date().toLocaleString("pt-BR"),
      supervisor,
      action,
      details,
    }
    setAuthorizationLog((prev) => [log, ...prev])
    console.log("Autorização registrada:", log)
  }

  const addToCart = (product: Product, weight?: number) => {
    if (product.requiresWeight && !weight) {
      setSelectedProductForWeight(product)
      setShowWeightDialog(true)
      return
    }

    const finalWeight = weight || 1
    const totalPrice = product.requiresWeight ? product.price * finalWeight : product.price

    setCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.id === product.id && (!product.requiresWeight || item.weight === finalWeight),
      )

      if (existingItemIndex >= 0 && !product.requiresWeight) {
        // Para produtos normais, aumentar quantidade
        return prev.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1, totalPrice: item.totalPrice + product.price }
            : item,
        )
      } else {
        // Para produtos por peso ou novos produtos
        const newItem: CartItem = {
          ...product,
          quantity: 1,
          weight: finalWeight,
          totalPrice: totalPrice,
        }
        return [...prev, newItem]
      }
    })

    // Esconder lista após adicionar produto
    setShowProductList(false)
    setSearchTerm("")
  }

  const handleWeightConfirm = (weight: number) => {
    if (selectedProductForWeight) {
      addToCart(selectedProductForWeight, weight)
      setSelectedProductForWeight(null)
    }
  }

  const updateQuantity = (id: string, quantity: number, weight?: number) => {
    if (quantity <= 0) {
      const item = cart.find((item) => item.id === id && (!weight || item.weight === weight))
      requestAuthorization({
        type: "remove-item",
        title: "Remover Item",
        description: `Remover "${item?.name}" do carrinho. Esta ação requer autorização do fiscal.`,
        action: () => removeFromCartDirect(id, weight),
        itemId: id,
      })
      return
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id && (!weight || item.weight === weight)) {
          const newTotalPrice = item.requiresWeight ? item.price * (item.weight || 1) * quantity : item.price * quantity
          return { ...item, quantity, totalPrice: newTotalPrice }
        }
        return item
      }),
    )
  }

  const removeFromCart = (id: string, weight?: number) => {
    const item = cart.find((item) => item.id === id && (!weight || item.weight === weight))
    requestAuthorization({
      type: "remove-item",
      title: "Remover Item",
      description: `Remover "${item?.name}" do carrinho. Esta ação requer autorização do fiscal.`,
      action: () => removeFromCartDirect(id, weight),
      itemId: id,
    })
  }

  const removeFromCartDirect = (id: string, weight?: number) => {
    const item = cart.find((item) => item.id === id && (!weight || item.weight === weight))
    setCart((prev) => prev.filter((item) => !(item.id === id && (!weight || item.weight === weight))))
    if (selectedCartIndex >= 0) {
      setSelectedCartIndex(-1)
    }
    return item?.name || "Item"
  }

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)

  // Calcular desconto baseado no tipo
  const discountAmount = discountType === "percentage" ? (subtotal * discount) / 100 : Math.min(discountValue, subtotal) // Não pode ser maior que o subtotal

  const total = subtotal - discountAmount

  const handleBarcodeSearch = () => {
    const product = products.find((p) => p.barcode === barcode)
    if (product) {
      addToCart(product)
      setBarcode("")
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filteredProducts.length === 1) {
      addToCart(filteredProducts[0])
      setSearchTerm("")
    }
  }

  const requestAuthorization = (request: AuthorizationRequest) => {
    setAuthorizationRequest(request)
  }

  const handleAuthorization = (supervisor: string) => {
    if (authorizationRequest) {
      let details = ""
      let actionName = ""

      if (authorizationRequest.type === "discount") {
        actionName = "Aplicar Desconto"
        if (discountType === "percentage") {
          details = `Desconto de ${tempDiscount}% aplicado. Valor: R$ ${((subtotal * tempDiscount) / 100).toFixed(2)}`
        } else {
          details = `Desconto de R$ ${tempDiscountValue.toFixed(2)} aplicado`
        }
      } else if (authorizationRequest.type === "clear-cart") {
        actionName = "Limpar Carrinho"
        details = `Carrinho com ${cart.length} itens limpo. Valor total: R$ ${total.toFixed(2)}`
      } else if (authorizationRequest.type === "remove-item") {
        const itemName = removeFromCartDirect(authorizationRequest.itemId!)
        actionName = "Remover Item"
        details = `Item "${itemName}" removido do carrinho`
        setAuthorizationRequest(null)
        logAuthorization(supervisor, actionName, details)
        return
      }

      authorizationRequest.action()
      logAuthorization(supervisor, actionName, details)
      setAuthorizationRequest(null)
    }
  }

  const clearCart = () => {
    if (cart.length === 0) return

    requestAuthorization({
      type: "clear-cart",
      title: "Limpar Carrinho",
      description: `Limpar carrinho com ${cart.length} itens (Total: R$ ${total.toFixed(2)}). Esta ação requer autorização do fiscal.`,
      action: () => clearCartDirect(),
    })
  }

  const clearCartDirect = () => {
    setCart([])
    setDiscount(0)
    setTempDiscount(0)
    setDiscountValue(0)
    setTempDiscountValue(0)
    setPaymentMethod(null)
    setSelectedCartIndex(-1)
    setPixPaymentConfirmed(false)
    setSelectedCardType("")
    setMixedPayments([])
  }

  const handleDiscountChange = (value: number, type: "percentage" | "value") => {
    if (type === "percentage") {
      setTempDiscount(value)
      if (value > discount) {
        requestAuthorization({
          type: "discount",
          title: "Aplicar Desconto",
          description: `Aplicar desconto de ${value}% (R$ ${((subtotal * value) / 100).toFixed(2)}). Esta ação requer autorização do fiscal.`,
          action: () => applyDiscount(value, type),
        })
      } else {
        setDiscount(value)
      }
    } else {
      setTempDiscountValue(value)
      if (value > discountValue) {
        requestAuthorization({
          type: "discount",
          title: "Aplicar Desconto",
          description: `Aplicar desconto de R$ ${value.toFixed(2)}. Esta ação requer autorização do fiscal.`,
          action: () => applyDiscount(value, type),
        })
      } else {
        setDiscountValue(value)
      }
    }
  }

  const applyDiscount = (value: number, type: "percentage" | "value") => {
    if (type === "percentage") {
      setDiscount(value)
    } else {
      setDiscountValue(value)
    }
  }

  const hasPermission = (module: string, action: string) => {
    if (!currentUser) return false
    if (currentUser.role === "admin") return true

    const permission = currentUser.permissions.find((p) => p.module === module)
    return permission?.actions.includes(action) || permission?.actions.includes("*")
  }

  const completeSale = (receivedAmount?: number, changeAmount?: number, receiptType?: string) => {
    // ADICIONAR verificação para evitar venda com carrinho vazio
    if (cart.length === 0) {
      alert("Não é possível finalizar venda com carrinho vazio!")
      return
    }

    // ADICIONAR verificação para evitar venda com total zero
    if (total <= 0) {
      alert("Não é possível finalizar venda com valor zero!")
      return
    }

    if (!receiptType && currentUser) {
      const userPermissions = receiptConfig.rolePermissions[currentUser.role]
      if (userPermissions?.canChoose) {
        setShowReceiptSelection(true)
        return
      } else {
        receiptType = userPermissions?.defaultType || "receipt"
      }
    }

    let message = `Venda finalizada!\nTotal: R$ ${total.toFixed(2)}`

    // Adicionar informações do comprovante
    if (receiptType === "fiscal") {
      message += `\n📄 Cupom Fiscal emitido`
    } else if (receiptType === "receipt") {
      message += `\n📋 Recibo simples emitido`
    } else if (receiptType === "both") {
      message += `\n📄 Cupom Fiscal emitido\n📋 Recibo simples emitido`
    }

    if (mixedPayments.length > 0) {
      message += `\nPagamento Misto:`
      mixedPayments.forEach((payment) => {
        message += `\n- ${payment.name}: R$ ${payment.amount.toFixed(2)}`
        if (payment.type === "pix") {
          message += " (PIX Confirmado)"
        }
      })
    } else if (paymentMethod) {
      let paymentName = paymentMethod
      if (paymentMethod === "cartao" && selectedCardType) {
        paymentName = `Cartão ${selectedCardType}`
      }
      message += `\nPagamento: ${paymentName}`
    }

    if (paymentMethod === "dinheiro" && receivedAmount && changeAmount !== undefined) {
      message += `\nRecebido: R$ ${receivedAmount.toFixed(2)}`
      if (changeAmount > 0) {
        message += `\nTroco: R$ ${changeAmount.toFixed(2)}`
      } else {
        message += `\nTroco: Valor exato`
      }
    }

    alert(message)
    clearCartDirect()
  }

  const finalizeSale = () => {
    // ADICIONAR verificações antes de finalizar
    if (cart.length === 0) {
      alert("Adicione produtos ao carrinho antes de finalizar a venda!")
      return
    }

    if (total <= 0) {
      alert("O valor total deve ser maior que zero!")
      return
    }

    if (!paymentMethod && mixedPayments.length === 0) {
      alert("Selecione uma forma de pagamento!")
      return
    }

    if (paymentMethod === "dinheiro") {
      setShowCashPayment(true)
      return
    }

    if (paymentMethod === "pix") {
      if (!pixPaymentConfirmed) {
        setShowPixPayment(true)
        return
      }
    }

    if (paymentMethod === "cartao" && !selectedCardType) {
      setShowCardSelection(true)
      return
    }

    // Para cartão e PIX confirmado, finalizar diretamente
    completeSale()
  }

  const focusSearchInput = () => {
    searchInputRef.current?.focus()
  }

  const focusBarcodeInput = () => {
    barcodeInputRef.current?.focus()
  }

  const focusDiscountInput = () => {
    if (discountType === "percentage") {
      discountInputRef.current?.focus()
    } else {
      discountValueInputRef.current?.focus()
    }
  }

  const removeSelectedCartItem = () => {
    if (selectedCartIndex >= 0 && selectedCartIndex < cart.length) {
      const item = cart[selectedCartIndex]
      removeFromCart(item.id, item.weight)
    }
  }

  const increaseSelectedCartItem = () => {
    if (selectedCartIndex >= 0 && selectedCartIndex < cart.length) {
      const item = cart[selectedCartIndex]
      updateQuantity(item.id, item.quantity + 1, item.weight)
    }
  }

  const decreaseSelectedCartItem = () => {
    if (selectedCartIndex >= 0 && selectedCartIndex < cart.length) {
      const item = cart[selectedCartIndex]
      updateQuantity(item.id, item.quantity - 1, item.weight)
    }
  }

  const navigateCart = (direction: "up" | "down") => {
    if (cart.length === 0) return

    if (direction === "up") {
      setSelectedCartIndex((prev) => (prev <= 0 ? cart.length - 1 : prev - 1))
    } else {
      setSelectedCartIndex((prev) => (prev >= cart.length - 1 ? 0 : prev + 1))
    }
  }

  const navigateToScreen = (screen: string) => {
    if (screen === "cadastro" && !hasPermission("products", "manage")) {
      alert("Acesso negado. Você não tem permissão para acessar o cadastro de produtos.")
      return
    }
    if (screen === "etiquetas" && !hasPermission("labels", "config")) {
      alert("Acesso negado. Você não tem permissão para acessar as etiquetas.")
      return
    }
    setCurrentScreen(screen)
  }

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
      action: () => setPaymentMethod("dinheiro"),
      description: "Pagamento em Dinheiro",
    },
    {
      key: "F4",
      action: () => setPaymentMethod("cartao"),
      description: "Pagamento no Cartão",
    },
    {
      key: "F5",
      action: () => setPaymentMethod("pix"),
      description: "Pagamento via PIX",
    },
    {
      key: "F6",
      action: () => setCurrentScreen("historico"),
      description: "Histórico de Vendas",
    },
    {
      key: "F7",
      action: focusDiscountInput,
      description: "Aplicar Desconto",
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
      description: "Aumentar Quantidade",
    },
    {
      key: "-",
      action: decreaseSelectedCartItem,
      description: "Diminuir Quantidade",
    },
  ])

  const openMixedPayment = () => {
    setShowMixedPayment(true)
  }

  // Renderizar telas diferentes
  if (currentScreen === "historico") {
    return <HistoricoVendas onBack={() => setCurrentScreen("pdv")} />
  }

  if (currentScreen === "cadastro") {
    return (
      <CadastroProdutos onBack={() => setCurrentScreen("pdv")} products={products} onUpdateProducts={setProducts} />
    )
  }

  if (currentScreen === "etiquetas") {
    return <EtiquetasPreco onBack={() => setCurrentScreen("pdv")} products={products} />
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sistema PDV - Caixa</h1>
            <p className="text-sm text-gray-600">Ponto de Venda</p>
          </div>
          <div className="flex gap-2">
            <KeyboardShortcutsHelp shortcuts={shortcuts} />
            {hasPermission("labels", "config") && (
              <Button onClick={() => setShowLabelConfig(true)} variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Config. Etiquetas</span>
              </Button>
            )}
            {hasPermission("cash", "manage") && (
              <Button
                onClick={() => {
                  setCashAction(cashSession ? "close" : "open")
                  setShowCashManagement(true)
                }}
                variant="outline"
                size="sm"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{cashSession ? "Fechar Caixa" : "Abrir Caixa"}</span>
              </Button>
            )}
            <Button onClick={() => navigateToScreen("cadastro")} variant="outline" size="sm">
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Produtos</span>
            </Button>
            <Button onClick={() => navigateToScreen("etiquetas")} variant="outline" size="sm">
              <Tag className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Etiquetas</span>
            </Button>
            <Button onClick={() => setCurrentScreen("historico")} variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Histórico (F6)</span>
              <span className="sm:hidden">F6</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
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
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        ref={barcodeInputRef}
                        placeholder="Código de barras (F9)"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleBarcodeSearch()}
                        className="flex-1"
                      />
                      <Button onClick={handleBarcodeSearch} title="F10" size="sm">
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
                          <p className="text-gray-500 text-center py-8">Nenhum produto encontrado</p>
                        ) : (
                          <div className="space-y-2">
                            {filteredProducts.map((product) => (
                              <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow p-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-sm">{product.name}</h3>
                                      {product.requiresWeight && (
                                        <Scale className="w-3 h-3 text-orange-600" title="Produto por peso" />
                                      )}
                                      {product.icms && (
                                        <Badge variant="outline" className="text-xs">
                                          ICMS {product.icms}%
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {product.category}
                                      </Badge>
                                      <span className="text-xs text-gray-500">{product.barcode}</span>
                                      <span className="text-xs text-blue-600">
                                        {product.requiresWeight
                                          ? `R$ ${product.price.toFixed(2)}/kg`
                                          : `R$ ${product.price.toFixed(2)}/${product.unit}`}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Button onClick={() => addToCart(product)} size="sm" className="mt-1">
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
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Sua Empresa</h3>
                      <p className="text-sm text-gray-500">Use F8 para buscar produtos ou F9 para código de barras</p>
                    </div>
                  </div>

                  {/* QR Code PIX - quando necessário */}
                  {paymentMethod === "pix" && total > 0 && (
                    <div className="absolute bottom-4 right-4 p-4 border rounded-lg bg-white shadow-lg">
                      <h3 className="font-semibold mb-3 text-center text-sm">QR Code PIX</h3>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <p className="text-xs">QR Code PIX</p>
                            <p className="text-xs mt-1">R$ {total.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 text-center max-w-32">Escaneie para pagar</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Carrinho */}
            <div className="flex flex-col min-h-0">
              <Card className="flex-1 flex flex-col min-h-0">
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
                          <p className="text-gray-500 text-center">Carrinho vazio</p>
                        </div>
                      ) : (
                        <div className="space-y-2 pr-2">
                          {cart.map((item, index) => (
                            <div
                              key={`${item.id}-${item.weight || "unit"}`}
                              className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
                                selectedCartIndex === index ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                              }`}
                              onClick={() => setSelectedCartIndex(index)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-sm truncate">{item.name}</p>
                                  {item.requiresWeight && <Scale className="w-3 h-3 text-orange-600" />}
                                  {item.icms && (
                                    <Badge variant="outline" className="text-xs">
                                      ICMS {item.icms}%
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.requiresWeight ? (
                                    <span>
                                      {item.weight?.toFixed(3)} kg × R$ {item.price.toFixed(2)}/kg
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
                                    e.stopPropagation()
                                    updateQuantity(item.id, item.quantity - 1, item.weight)
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateQuantity(item.id, item.quantity + 1, item.weight)
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
                                  e.stopPropagation()
                                  removeFromCart(item.id, item.weight)
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

                  {/* Desconto */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {discountType === "percentage" ? (
                        <Percent className="w-4 h-4" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}
                      <Label className="text-sm">Desconto (F7)</Label>
                      <Shield className="w-4 h-4 text-orange-600" title="Requer cartão de autorização" />
                    </div>

                    {/* Toggle entre % e R$ */}
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
                          const value = Number(e.target.value)
                          setTempDiscount(value)
                        }}
                        onBlur={(e) => {
                          const value = Number(e.target.value)
                          if (value !== discount) {
                            handleDiscountChange(value, "percentage")
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const value = Number((e.target as HTMLInputElement).value)
                            if (value !== discount) {
                              handleDiscountChange(value, "percentage")
                            }
                          }
                        }}
                        placeholder="0"
                        className="h-8"
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
                          const value = Number(e.target.value)
                          setTempDiscountValue(value)
                        }}
                        onBlur={(e) => {
                          const value = Number(e.target.value)
                          if (value !== discountValue) {
                            handleDiscountChange(value, "value")
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const value = Number((e.target as HTMLInputElement).value)
                            if (value !== discountValue) {
                              handleDiscountChange(value, "value")
                            }
                          }
                        }}
                        placeholder="0,00"
                        className="h-8"
                      />
                    )}
                  </div>

                  <Separator />

                  {/* Totais */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>
                          Desconto ({discountType === "percentage" ? `${discount}%` : `R$ ${discountValue.toFixed(2)}`}
                          ):
                        </span>
                        <span>-R$ {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total:</span>
                      <span className="text-green-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Pagamento */}
                  <div className="space-y-2">
                    <Label className="text-sm">Forma de Pagamento</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        variant={paymentMethod === "dinheiro" ? "default" : "outline"}
                        onClick={() => {
                          setPaymentMethod("dinheiro")
                          setPixPaymentConfirmed(false)
                          setSelectedCardType("")
                        }}
                        className="flex items-center gap-1 text-xs h-8"
                        title="F3"
                      >
                        <Banknote className="w-3 h-3" />
                        <span className="hidden sm:inline">Dinheiro</span>
                        <span className="sm:hidden">$</span>
                      </Button>
                      <Button
                        variant={paymentMethod === "cartao" ? "default" : "outline"}
                        onClick={() => {
                          setPaymentMethod("cartao")
                          setPixPaymentConfirmed(false)
                          setShowCardSelection(true)
                        }}
                        className="flex items-center gap-1 text-xs h-8"
                        title="F4"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span className="hidden sm:inline">Cartão</span>
                        <span className="sm:hidden">💳</span>
                      </Button>
                      <Button
                        variant={paymentMethod === "pix" ? "default" : "outline"}
                        onClick={() => {
                          setPaymentMethod("pix")
                          setPixPaymentConfirmed(false)
                          setSelectedCardType("")
                        }}
                        className="flex items-center gap-1 text-xs h-8"
                        title="F5"
                      >
                        <QrCode className="w-3 h-3" />
                        PIX
                      </Button>
                    </div>

                    {/* Botão Pagamento Misto */}
                    <Button variant="outline" onClick={openMixedPayment} className="w-full h-8 text-xs bg-transparent">
                      <Calculator className="w-3 h-3 mr-1" />
                      Pagamento Misto
                    </Button>

                    {/* Status dos Pagamentos */}
                    {paymentMethod === "cartao" && selectedCardType && (
                      <div className="text-center p-1 bg-blue-50 rounded text-xs">
                        <span className="text-blue-600">Cartão: {selectedCardType}</span>
                      </div>
                    )}

                    {paymentMethod === "pix" && pixPaymentConfirmed && (
                      <div className="text-center p-1 bg-green-50 rounded text-xs">
                        <span className="text-green-600">✅ PIX Confirmado</span>
                      </div>
                    )}

                    {mixedPayments.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-xs">Pagamentos:</Label>
                        {mixedPayments.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-1 bg-gray-50 rounded text-xs">
                            <span>{payment.name}</span>
                            <span className="font-semibold">R$ {payment.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
      <AuthorizationDialog
        open={!!authorizationRequest}
        onOpenChange={(open) => !open && setAuthorizationRequest(null)}
        title={authorizationRequest?.title || ""}
        description={authorizationRequest?.description || ""}
        onAuthorize={handleAuthorization}
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
          setMixedPayments(payments)
          setPaymentMethod(null)
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
          setCurrentUser(user)
          setShowLogin(false)
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
            })
          } else {
            setCashSession(null)
          }
          setShowCashManagement(false)
        }}
        userName={currentUser?.name || "Usuário"}
      />

      {/* Receipt Selection Dialog */}
      <ReceiptSelectionDialog
        open={showReceiptSelection}
        onOpenChange={setShowReceiptSelection}
        onSelect={(type) => completeSale(undefined, undefined, type)}
        canChoose={currentUser ? receiptConfig.rolePermissions[currentUser.role]?.canChoose || false : false}
        defaultType={
          currentUser ? receiptConfig.rolePermissions[currentUser.role]?.defaultType || "receipt" : "receipt"
        }
      />
    </div>
  )
}
