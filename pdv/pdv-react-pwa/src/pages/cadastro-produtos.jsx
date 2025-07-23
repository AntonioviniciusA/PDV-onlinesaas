import { useState, useRef, useEffect } from "react";
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
import { ScrollArea } from "../components/ui/scroll-area.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Alert, AlertDescription } from "../components/ui/alert.jsx";
import { BtnVoltarPDV } from "../components/BtnVoltarPDV.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog.jsx";
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
} from "lucide-react";
import { CSVImportDialog } from "../components/csv-import-dialog.jsx";
import { calculateComparativePrice } from "../components/unit-converter.js";
import { produtosServices } from "../services/produtosServices.js";

export default function CadastroProdutos() {
  const id_loja = "1"; // Ajuste conforme sua lógica de autenticação
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    // Campos básicos
    name: "",
    price: "",
    category: "",
    barcode: "",
    requiresWeight: false,
    unit: "un",
    icms: "",
    quantity: "",
    measureUnit: "un",

    // Campos adicionais da tabela produto
    codigo: "",
    codigo_barras: "",
    descricao: "",
    grupo: "",
    ncm: "",
    preco_custo: "",
    margem_lucro: "",
    preco_venda: "",
    estoque_minimo: "",
    estoque_maximo: "",
    estoque_atual: "",
    unidade: "un",
    controla_estoque: false,
    cfop: "",
    csosn: "",
    cst: "",
    ativo: true,
    exibir_tela: true,
    solicita_quantidade: false,
    permitir_combinacao: false,
    cest: "",
    cst_pis: "",
    pis: "",
    cst_cofins: "",
    cofins: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchInputRef = useRef(null);

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
  ];

  // Carregar produtos ao montar
  useEffect(() => {
    fetchProdutos();
    // eslint-disable-next-line
  }, []);

  const fetchProdutos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await produtosServices.getProdutos(id_loja);
      setProducts(res.produtos || []);
    } catch (err) {
      setError("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  // Ajustar filteredProducts para usar o estado local
  const filteredProducts = products.filter(
    (product) =>
      (product.descricao || product.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (product.grupo || product.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (product.codigo_barras || product.barcode || "").includes(searchTerm)
  );

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!data.price || Number(data.price) <= 0)
      newErrors.price = "Preço deve ser maior que zero";
    if (!data.category.trim()) newErrors.category = "Categoria é obrigatória";
    if (!data.barcode.trim())
      newErrors.barcode = "Código de barras é obrigatório";
    if (data.barcode.length < 8)
      newErrors.barcode = "Código deve ter pelo menos 8 dígitos";

    // Validar ICMS
    if (data.icms && (Number(data.icms) < 0 || Number(data.icms) > 100)) {
      newErrors.icms = "ICMS deve estar entre 0 e 100%";
    }

    // Validar quantidade para comparação
    if (data.quantity && Number(data.quantity) <= 0) {
      newErrors.quantity = "Quantidade deve ser maior que zero";
    }

    // Verificar se código de barras já existe (exceto para edição do mesmo produto)
    const existingProduct = products.find(
      (p) => p.barcode === data.barcode && p.id !== editingProduct?.id
    );
    if (existingProduct) {
      newErrors.barcode = "Código de barras já existe";
    }

    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    setError("");
    try {
      const productData = {
        id_loja,
        codigo: formData.codigo.trim(),
        codigo_barras: formData.codigo_barras.trim(),
        descricao: formData.descricao.trim() || formData.name.trim(),
        grupo: formData.grupo.trim(),
        ncm: formData.ncm.trim(),
        preco_custo: formData.preco_custo
          ? Number(formData.preco_custo)
          : undefined,
        margem_lucro: formData.margem_lucro
          ? Number(formData.margem_lucro)
          : undefined,
        preco_venda: formData.price ? Number(formData.price) : undefined,
        estoque_minimo: formData.estoque_minimo
          ? Number(formData.estoque_minimo)
          : undefined,
        estoque_maximo: formData.estoque_maximo
          ? Number(formData.estoque_maximo)
          : undefined,
        estoque_atual: formData.estoque_atual
          ? Number(formData.estoque_atual)
          : undefined,
        unidade: formData.unidade,
        controla_estoque: formData.controla_estoque,
        cfop: formData.cfop.trim(),
        csosn: formData.csosn.trim(),
        cst: formData.cst.trim(),
        icms: formData.icms ? Number(formData.icms) : undefined,
        ativo: formData.ativo,
        exibir_tela: formData.exibir_tela,
        solicita_quantidade: formData.solicita_quantidade,
        permitir_combinacao: formData.permitir_combinacao,
        cest: formData.cest.trim(),
        cst_pis: formData.cst_pis.trim(),
        pis: formData.pis ? Number(formData.pis) : undefined,
        cst_cofins: formData.cst_cofins.trim(),
        cofins: formData.cofins ? Number(formData.cofins) : undefined,
      };
      if (editingProduct) {
        await produtosServices.updateProduto(editingProduct.id, productData);
        setSuccess("Produto atualizado com sucesso!");
      } else {
        await produtosServices.createProduto(productData);
        setSuccess("Produto cadastrado com sucesso!");
      }
      await fetchProdutos();
      handleCancel();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowAddDialog(false);
    setFormData({
      // Campos básicos
      name: "",
      price: "",
      category: "",
      barcode: "",
      requiresWeight: false,
      unit: "un",
      icms: "",
      quantity: "",
      measureUnit: "un",

      // Campos adicionais da tabela produto
      codigo: "",
      codigo_barras: "",
      descricao: "",
      grupo: "",
      ncm: "",
      preco_custo: "",
      margem_lucro: "",
      preco_venda: "",
      estoque_minimo: "",
      estoque_maximo: "",
      estoque_atual: "",
      unidade: "un",
      controla_estoque: false,
      cfop: "",
      csosn: "",
      cst: "",
      ativo: true,
      exibir_tela: true,
      solicita_quantidade: false,
      permitir_combinacao: false,
      cest: "",
      cst_pis: "",
      pis: "",
      cst_cofins: "",
      cofins: "",
    });
    setErrors({});
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      barcode: product.barcode,
      requiresWeight: product.requiresWeight,
      unit: product.unit,
      icms: product.icms?.toString(),
      quantity: product.quantity?.toString(),
      measureUnit: product.measureUnit,

      // Campos adicionais da tabela produto
      codigo: product.codigo || "",
      codigo_barras: product.codigo_barras || "",
      descricao: product.descricao || "",
      grupo: product.grupo || "",
      ncm: product.ncm || "",
      preco_custo: product.preco_custo?.toString() || "",
      margem_lucro: product.margem_lucro?.toString() || "",
      preco_venda: product.preco_venda?.toString() || "",
      estoque_minimo: product.estoque_minimo?.toString() || "",
      estoque_maximo: product.estoque_maximo?.toString() || "",
      estoque_atual: product.estoque_atual?.toString() || "",
      unidade: product.unidade || "un",
      controla_estoque: product.controla_estoque || false,
      cfop: product.cfop || "",
      csosn: product.csosn || "",
      cst: product.cst || "",
      ativo: product.ativo !== undefined ? product.ativo : true,
      exibir_tela:
        product.exibir_tela !== undefined ? product.exibir_tela : true,
      solicita_quantidade: product.solicita_quantidade || false,
      permitir_combinacao: product.permitir_combinacao || false,
      cest: product.cest || "",
      cst_pis: product.cst_pis || "",
      pis: product.pis?.toString() || "",
      cst_cofins: product.cst_cofins || "",
      cofins: product.cofins?.toString() || "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (product) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir "${product.descricao || product.name}"?`
      )
    ) {
      setLoading(true);
      setError("");
      try {
        await produtosServices.deleteProduto(product.id, id_loja);
        setSuccess("Produto excluído com sucesso!");
        await fetchProdutos();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Erro ao excluir produto");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      // Campos básicos
      name: "",
      price: "",
      category: "",
      barcode: "",
      requiresWeight: false,
      unit: "un",
      icms: "",
      quantity: "",
      measureUnit: "un",

      // Campos adicionais da tabela produto
      codigo: "",
      codigo_barras: "",
      descricao: "",
      grupo: "",
      ncm: "",
      preco_custo: "",
      margem_lucro: "",
      preco_venda: "",
      estoque_minimo: "",
      estoque_maximo: "",
      estoque_atual: "",
      unidade: "un",
      controla_estoque: false,
      cfop: "",
      csosn: "",
      cst: "",
      ativo: true,
      exibir_tela: true,
      solicita_quantidade: false,
      permitir_combinacao: false,
      cest: "",
      cst_pis: "",
      pis: "",
      cst_cofins: "",
      cofins: "",
    });
    setShowAddDialog(true);
  };

  // Calcular preço comparativo em tempo real
  const getComparativePrice = () => {
    if (!formData.price || !formData.quantity || !formData.measureUnit)
      return null;

    const price = Number(formData.price);
    const quantity = Number(formData.quantity);

    if (price <= 0 || quantity <= 0) return null;

    return calculateComparativePrice(price, quantity, formData.measureUnit);
  };

  const comparativePrice = getComparativePrice();

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BtnVoltarPDV />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Cadastro de Produtos
              </h1>
              <p className="text-sm text-gray-600">
                Gerenciar produtos do sistema
              </p>
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
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
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
              {loading && (
                <div className="p-4 text-blue-600">Carregando...</div>
              )}
              {error && <div className="p-4 text-red-600">{error}</div>}
              <ScrollArea className="h-full">
                {filteredProducts.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm
                          ? "Nenhum produto encontrado"
                          : "Nenhum produto cadastrado"}
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
                      const hasComparison =
                        product.quantity &&
                        product.measureUnit &&
                        product.quantity > 0;
                      const comparison = hasComparison
                        ? calculateComparativePrice(
                            product.price,
                            product.quantity,
                            product.measureUnit
                          )
                        : null;

                      return (
                        <Card key={product.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {product.name}
                                </h3>
                                {product.requiresWeight && (
                                  <Scale
                                    className="w-4 h-4 text-orange-600"
                                    title="Produto por peso"
                                  />
                                )}
                                {comparison && (
                                  <Calculator
                                    className="w-4 h-4 text-blue-600"
                                    title="Com comparação de preço"
                                  />
                                )}
                                <Badge variant="secondary">
                                  {product.category}
                                </Badge>
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
                                    {product.requiresWeight
                                      ? "/kg"
                                      : `/${product.unit}`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">
                                    Código de Barras
                                  </p>
                                  <p className="font-mono text-xs">
                                    {product.barcode}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Unidade</p>
                                  <p>
                                    {product.requiresWeight
                                      ? "Por peso (kg)"
                                      : product.unit}
                                  </p>
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
                                    <p className="font-semibold text-blue-600 text-xs">
                                      {comparison.comparison}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(product)}
                              >
                                <Trash2 className="w-4 h-4" />
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

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className=" max-w-5xl max-h-screen overflow-y-auto">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Coca-Cola 350ml"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    placeholder="Descrição detalhada do produto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="codigo">Código Interno</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo: e.target.value })
                    }
                    placeholder="Código interno"
                  />
                </div>

                <div>
                  <Label htmlFor="codigo_barras">Código de Barras</Label>
                  <Input
                    id="codigo_barras"
                    value={formData.codigo_barras}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codigo_barras: e.target.value,
                      })
                    }
                    placeholder="Código de barras"
                  />
                </div>

                <div>
                  <Label htmlFor="barcode">
                    Código de Barras (Principal) *
                  </Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    placeholder="Ex: 7894900011517"
                    className={errors.barcode ? "border-red-500" : ""}
                  />
                  {errors.barcode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.barcode}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md ${
                      errors.category ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="grupo">Grupo</Label>
                  <Input
                    id="grupo"
                    value={formData.grupo}
                    onChange={(e) =>
                      setFormData({ ...formData, grupo: e.target.value })
                    }
                    placeholder="Grupo do produto"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Informações de Preço */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações de Preço</h3>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="preco_custo">Preço de Custo</Label>
                  <Input
                    id="preco_custo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_custo}
                    onChange={(e) =>
                      setFormData({ ...formData, preco_custo: e.target.value })
                    }
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="margem_lucro">Margem de Lucro (%)</Label>
                  <Input
                    id="margem_lucro"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.margem_lucro}
                    onChange={(e) =>
                      setFormData({ ...formData, margem_lucro: e.target.value })
                    }
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Preço de Venda *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0,00"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Informações de Estoque */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações de Estoque</h3>

              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="controla_estoque"
                  checked={formData.controla_estoque}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      controla_estoque: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="controla_estoque">Controlar Estoque</Label>
              </div>

              {formData.controla_estoque && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                    <Input
                      id="estoque_minimo"
                      type="number"
                      min="0"
                      value={formData.estoque_minimo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estoque_minimo: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estoque_maximo">Estoque Máximo</Label>
                    <Input
                      id="estoque_maximo"
                      type="number"
                      min="0"
                      value={formData.estoque_maximo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estoque_maximo: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estoque_atual">Estoque Atual</Label>
                    <Input
                      id="estoque_atual"
                      type="number"
                      min="0"
                      value={formData.estoque_atual}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estoque_atual: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Informações Fiscais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Fiscais</h3>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="ncm">NCM</Label>
                  <Input
                    id="ncm"
                    value={formData.ncm}
                    onChange={(e) =>
                      setFormData({ ...formData, ncm: e.target.value })
                    }
                    placeholder="Código NCM"
                  />
                </div>

                <div>
                  <Label htmlFor="cfop">CFOP</Label>
                  <Input
                    id="cfop"
                    value={formData.cfop}
                    onChange={(e) =>
                      setFormData({ ...formData, cfop: e.target.value })
                    }
                    placeholder="Código CFOP"
                  />
                </div>

                <div>
                  <Label htmlFor="cest">CEST</Label>
                  <Input
                    id="cest"
                    value={formData.cest}
                    onChange={(e) =>
                      setFormData({ ...formData, cest: e.target.value })
                    }
                    placeholder="Código CEST"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="csosn">CSOSN</Label>
                  <Input
                    id="csosn"
                    value={formData.csosn}
                    onChange={(e) =>
                      setFormData({ ...formData, csosn: e.target.value })
                    }
                    placeholder="CSOSN"
                  />
                </div>

                <div>
                  <Label htmlFor="cst">CST</Label>
                  <Input
                    id="cst"
                    value={formData.cst}
                    onChange={(e) =>
                      setFormData({ ...formData, cst: e.target.value })
                    }
                    placeholder="CST"
                  />
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
                    onChange={(e) =>
                      setFormData({ ...formData, icms: e.target.value })
                    }
                    placeholder="0,00"
                    className={errors.icms ? "border-red-500" : ""}
                  />
                  {errors.icms && (
                    <p className="text-red-500 text-xs mt-1">{errors.icms}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pis">PIS (%)</Label>
                  <Input
                    id="pis"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pis}
                    onChange={(e) =>
                      setFormData({ ...formData, pis: e.target.value })
                    }
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="cst_pis">CST PIS</Label>
                  <Input
                    id="cst_pis"
                    value={formData.cst_pis}
                    onChange={(e) =>
                      setFormData({ ...formData, cst_pis: e.target.value })
                    }
                    placeholder="CST PIS"
                  />
                </div>

                <div>
                  <Label htmlFor="cst_cofins">CST COFINS</Label>
                  <Input
                    id="cst_cofins"
                    value={formData.cst_cofins}
                    onChange={(e) =>
                      setFormData({ ...formData, cst_cofins: e.target.value })
                    }
                    placeholder="CST COFINS"
                  />
                </div>

                <div>
                  <Label htmlFor="cofins">COFINS (%)</Label>
                  <Input
                    id="cofins"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cofins}
                    onChange={(e) =>
                      setFormData({ ...formData, cofins: e.target.value })
                    }
                    placeholder="0,00"
                  />
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
                <Label
                  htmlFor="requiresWeight"
                  className="flex items-center gap-2"
                >
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
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
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

              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ativo: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="ativo">Produto Ativo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="exibir_tela"
                    checked={formData.exibir_tela}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        exibir_tela: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="exibir_tela">Exibir na Tela</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="solicita_quantidade"
                    checked={formData.solicita_quantidade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        solicita_quantidade: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="solicita_quantidade">
                    Solicitar Quantidade
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="permitir_combinacao"
                  checked={formData.permitir_combinacao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permitir_combinacao: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="permitir_combinacao">Permitir Combinação</Label>
              </div>
            </div>

            <Separator />

            {/* Comparação de Preços */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Comparação de Preços</h3>
              </div>
              <p className="text-sm text-gray-600">
                Configure a quantidade e unidade para mostrar comparação de
                preços nas etiquetas
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
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="Ex: 350 (para 350ml)"
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="measureUnit">Unidade de Medida</Label>
                  <select
                    id="measureUnit"
                    value={formData.measureUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, measureUnit: e.target.value })
                    }
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
                    <span className="text-sm">
                      {comparativePrice.comparison}
                    </span>
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
        onImportComplete={fetchProdutos}
      />
    </div>
  );
}
