"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  Scale,
  CheckCircle,
  Upload,
  Calculator,
} from "lucide-react"
import { CSVImportDialog } from "./components/csv-import-dialog"
import { calculateComparativePrice } from "./components/unit-converter"

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

interface CadastroProdutosProps {
  onBack: () => void
  products: Product[]
  onUpdateProducts: (products: Product[]) => void
}

export default function CadastroProdutos({ onBack, products, onUpdateProducts }: CadastroProdutosProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    barcode: "",
    requiresWeight: false,
    unit: "un",
    icms: "",
    quantity: "",
    measureUnit: "un",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")
  const [showImportDialog, setShowImportDialog] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    "Bebidas",
    "Padaria",
    "Laticínios",
    "Grãos",
    "Frutas",
    "Verduras",
    "Carnes",
    "Óleos",
    "Massas",
    "Açúcar",
    "Limpeza",
    "Higiene",
  ]

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm),
  )

  const validateForm = (data: typeof formData) => {
    const newErrors: Record<string, string> = {}

    if (!data.name.trim()) newErrors.name = "Nome é obrigatório"
    if (!data.price || Number(data.price) <= 0) newErrors.price = "Preço deve ser maior que zero"
    if (!data.category.trim()) newErrors.category = "Categoria é obrigatória"
    if (!data.barcode.trim()) newErrors.barcode = "Código de barras é obrigatório"
    if (data.barcode.length < 8) newErrors.barcode = "Código deve ter pelo menos 8 dígitos"

    // Validar ICMS
    if (data.icms && (Number(data.icms) < 0 || Number(data.icms) > 100)) {
      newErrors.icms = "ICMS deve estar entre 0 e 100%"
    }

    // Validar quantidade para comparação
    if (data.quantity && Number(data.quantity) <= 0) {
      newErrors.quantity = "Quantidade deve ser maior que zero"
    }

    // Verificar se código de barras já existe (exceto para edição do mesmo produto)
    const existingProduct = products.find((p) => p.barcode === data.barcode && p.id !== editingProduct?.id)
    if (existingProduct) {
      newErrors.barcode = "Código de barras já existe"
    }

    return newErrors
  }

  const handleSave = () => {
    const newErrors = validateForm(formData)
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name.trim(),
      price: Number(formData.price),
      category: formData.category.trim(),
      barcode: formData.barcode.trim(),
      requiresWeight: formData.requiresWeight,
      unit: formData.unit,
      icms: formData.icms ? Number(formData.icms) : undefined,
      quantity: formData.quantity ? Number(formData.quantity) : undefined,
      measureUnit: formData.measureUnit || "un",
    }

    let updatedProducts: Product[]

    if (editingProduct) {
      // Editando produto existente
      updatedProducts = products.map((p) => (p.id === editingProduct.id ? productData : p))
      setSuccess("Produto atualizado com sucesso!")
    } else {
      // Adicionando novo produto
      updatedProducts = [...products, productData]
      setSuccess("Produto cadastrado com sucesso!")
    }

    onUpdateProducts(updatedProducts)
    handleCancel()

    // Limpar mensagem de sucesso após 3 segundos
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleCancel = () => {
    setEditingProduct(null)
    setShowAddDialog(false)
    setFormData({
      name: "",
      price: "",
      category: "",
      barcode: "",
      requiresWeight: false,
      unit: "un",
      icms: "",
      quantity: "",
      measureUnit: "un",
    })
    setErrors({})
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      barcode: product.barcode,
      requiresWeight: product.requiresWeight || false,
      unit: product.unit || "un",
      icms: product.icms?.toString() || "",
      quantity: product.quantity?.toString() || "",
      measureUnit: product.measureUnit || "un",
    })
    setShowAddDialog(true)
  }

  const handleDelete = (product: Product) => {
    if (confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      const updatedProducts = products.filter((p) => p.id !== product.id)
      onUpdateProducts(updatedProducts)
      setSuccess("Produto excluído com sucesso!")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      price: "",
      category: "",
      barcode: "",
      requiresWeight: false,
      unit: "un",
      icms: "",
      quantity: "",
      measureUnit: "un",
    })
    setShowAddDialog(true)
  }

  // Calcular preço comparativo em tempo real
  const getComparativePrice = () => {
    if (!formData.price || !formData.quantity || !formData.measureUnit) return null

    const price = Number(formData.price)
    const quantity = Number(formData.quantity)

    if (price <= 0 || quantity <= 0) return null

    return calculateComparativePrice(price, quantity, formData.measureUnit)
  }

  const comparativePrice = getComparativePrice()

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cadastro de Produtos</h1>
              <p className="text-sm text-gray-600">Gerenciar produtos do sistema</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowImportDialog(true)} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex-shrink-0 p-4">
          <div className="max-w-7xl mx-auto">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Produtos Cadastrados ({filteredProducts.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Buscar por nome, categoria ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {filteredProducts.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                      </p>
                      {!searchTerm && (
                        <Button onClick={handleAddNew} className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Cadastrar Primeiro Produto
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => {
                      const hasComparison = product.quantity && product.measureUnit && product.quantity > 0
                      const comparison = hasComparison
                        ? calculateComparativePrice(product.price, product.quantity!, product.measureUnit!)
                        : null

                      return (
                        <Card key={product.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                {product.requiresWeight && (
                                  <Scale className="w-4 h-4 text-orange-600" title="Produto por peso" />
                                )}
                                {comparison && (
                                  <Calculator className="w-4 h-4 text-blue-600" title="Com comparação de preço" />
                                )}
                                <Badge variant="secondary">{product.category}</Badge>
                                {product.icms && (
                                  <Badge variant="outline" className="text-xs">
                                    ICMS {product.icms}%
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Preço</p>
                                  <p className="font-semibold text-green-600">
                                    R$ {product.price.toFixed(2)}
                                    {product.requiresWeight ? "/kg" : `/${product.unit}`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Código de Barras</p>
                                  <p className="font-mono text-xs">{product.barcode}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Unidade</p>
                                  <p>{product.requiresWeight ? "Por peso (kg)" : product.unit}</p>
                                </div>
                                {hasComparison && (
                                  <div>
                                    <p className="text-gray-500">Quantidade</p>
                                    <p>
                                      {product.quantity} {product.measureUnit}
                                    </p>
                                  </div>
                                )}
                                {comparison && (
                                  <div>
                                    <p className="text-gray-500">Comparativo</p>
                                    <p className="font-semibold text-blue-600 text-xs">{comparison.comparison}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(product)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Básicas</h3>

              <div>
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Coca-Cola 350ml"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0,00"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <Label htmlFor="icms">ICMS (%)</Label>
                  <Input
                    id="icms"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.icms}
                    onChange={(e) => setFormData({ ...formData, icms: e.target.value })}
                    placeholder="0,00"
                    className={errors.icms ? "border-red-500" : ""}
                  />
                  {errors.icms && <p className="text-red-500 text-xs mt-1">{errors.icms}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full p-2 border rounded-md ${errors.category ? "border-red-500" : ""}`}
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label htmlFor="barcode">Código de Barras *</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Ex: 7894900011517"
                    className={errors.barcode ? "border-red-500" : ""}
                  />
                  {errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Configurações de Venda */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Configurações de Venda</h3>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresWeight"
                  checked={formData.requiresWeight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresWeight: e.target.checked,
                      unit: e.target.checked ? "kg" : "un",
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="requiresWeight" className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Produto vendido por peso
                </Label>
              </div>

              {!formData.requiresWeight && (
                <div>
                  <Label htmlFor="unit">Unidade de Venda</Label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="un">Unidade</option>
                    <option value="cx">Caixa</option>
                    <option value="pct">Pacote</option>
                    <option value="lt">Litro</option>
                    <option value="ml">Mililitro</option>
                  </select>
                </div>
              )}
            </div>

            <Separator />

            {/* Comparação de Preços */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Comparação de Preços</h3>
              </div>
              <p className="text-sm text-gray-600">
                Configure a quantidade e unidade para mostrar comparação de preços nas etiquetas
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quantity">Quantidade do Produto</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Ex: 350 (para 350ml)"
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>

                <div>
                  <Label htmlFor="measureUnit">Unidade de Medida</Label>
                  <select
                    id="measureUnit"
                    value={formData.measureUnit}
                    onChange={(e) => setFormData({ ...formData, measureUnit: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <optgroup label="Volume">
                      <option value="ml">Mililitro (ml)</option>
                      <option value="cl">Centilitro (cl)</option>
                      <option value="dl">Decilitro (dl)</option>
                      <option value="l">Litro (l)</option>
                    </optgroup>
                    <optgroup label="Peso">
                      <option value="mg">Miligrama (mg)</option>
                      <option value="g">Grama (g)</option>
                      <option value="kg">Quilograma (kg)</option>
                    </optgroup>
                    <optgroup label="Outros">
                      <option value="un">Unidade</option>
                      <option value="pct">Pacote</option>
                      <option value="cx">Caixa</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Preview da Comparação */}
              {comparativePrice && comparativePrice.comparison && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Preview da Etiqueta:</strong>
                    <br />
                    {formData.name} - R$ {formData.price}
                    <br />
                    <span className="text-sm">{comparativePrice.comparison}</span>
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <strong>Exemplos:</strong>
                <br />• Coca-Cola 350ml → Mostra preço por litro
                <br />• Arroz 1kg → Mostra preço por kg
                <br />• Sabão 500g → Mostra preço por kg
                <br />• Deixe em branco se não quiser comparação
              </div>
            </div>

            <Separator />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {editingProduct ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CSVImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        products={products}
        onImportComplete={onUpdateProducts}
      />
    </div>
  )
}
