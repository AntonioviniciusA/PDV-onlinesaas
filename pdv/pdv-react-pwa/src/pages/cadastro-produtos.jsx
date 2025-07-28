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
import {
  useProdutos,
  useCreateProduto,
  useUpdateProduto,
  useDeleteProduto,
} from "../hooks/useProducts.js";
import { produtosServices } from "../services/produtosServices.js";
import { localAuthService } from "../services/localAuthService.js";
import { ncmService } from "../services/ncmService.js";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs.jsx";

// Função utilitária para formatar preços
const formatPrice = (price) => {
  const numPrice = Number(price || 0);
  return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
};

export default function CadastroProdutos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  // Atualizar o formData inicial para garantir campos obrigatórios do banco
  const [formData, setFormData] = useState({
    codigo: "",
    codigo_barras: "",
    descricao: "",
    descricao_fiscal: "",
    grupo: "",
    ncm: "",
    cest: "",
    origem: "",
    cfop_entrada: "",
    cfop_saida: "",
    cst_entrada: "",
    cst_saida: "",
    modalidade_bc_icms: "",
    aliquota_icms: "",
    aliquota_ipi: "",
    aliquota_pis: "",
    aliquota_cofins: "",
    cst_pis: "",
    cst_cofins: "",
    credito_presumido: "",
    categoria_tributaria: "",
    cbs: "",
    ibs: "",
    ii: "",
    afrmm_fmm: "",
    preco_custo: "",
    margem_lucro: "",
    preco_venda: "",
    estoque_minimo: "",
    estoque_maximo: "",
    estoque_atual: "",
    unidade: "UN",
    controla_estoque: false,
    cfop: "",
    csosn: "",
    cst: "",
    icms: "",
    ativo: true,
    exibir_tela: true,
    solicita_quantidade: false,
    pis: "",
    cofins: "",
  });
  const [ncmError, setNcmError] = useState("");
  const [isLoadingNcm, setIsLoadingNcm] = useState(false);
  const [ncmSuccess, setNcmSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Usar hooks para operações de produtos
  const { mutateAsync: createProduto, isLoading: creatingProduto } =
    useCreateProduto();
  const { mutateAsync: updateProduto, isLoading: updatingProduto } =
    useUpdateProduto();
  const { mutateAsync: deleteProduto, isLoading: deletingProduto } =
    useDeleteProduto();

  // Usar hook para buscar produtos
  const {
    data: produtosData,
    isLoading: loading,
    error: produtosError,
    refetch: fetchProdutos,
  } = useProdutos();
  const products = produtosData || [];
  const error = produtosError?.message || "";

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
    // Os produtos são carregados automaticamente pelo hook useProdutos
  }, []);

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

  // Atualizar a validação para garantir obrigatoriedade e unicidade de codigo e codigo_barras
  const validateForm = (data) => {
    const newErrors = {};
    if (!data.codigo.trim()) newErrors.codigo = "Código interno é obrigatório";
    if (!data.codigo_barras.trim())
      newErrors.codigo_barras = "Código de barras é obrigatório";
    if (!data.descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
    if (!data.grupo.trim()) newErrors.grupo = "Grupo é obrigatório";
    if (!data.preco_venda || Number(data.preco_venda) <= 0)
      newErrors.preco_venda = "Preço de venda deve ser maior que zero";
    // Unicidade
    const existingCodigo = products.find(
      (p) => p.codigo === data.codigo && p.id !== editingProduct?.id
    );
    if (existingCodigo) newErrors.codigo = "Código interno já existe";
    const existingCodBarras = products.find(
      (p) =>
        p.codigo_barras === data.codigo_barras && p.id !== editingProduct?.id
    );
    if (existingCodBarras)
      newErrors.codigo_barras = "Código de barras já existe";
    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validateForm(formData);
    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      const productData = {
        codigo: formData.codigo.trim(),
        codigo_barras: formData.codigo_barras.trim(),
        descricao: formData.descricao.trim(),
        descricao_fiscal: formData.descricao_fiscal.trim(),
        grupo: formData.grupo.trim(),
        ncm: formData.ncm.trim(),
        cest: formData.cest.trim(),
        origem: formData.origem,
        cfop_entrada: formData.cfop_entrada.trim(),
        cfop_saida: formData.cfop_saida.trim(),
        cst_entrada: formData.cst_entrada.trim(),
        cst_saida: formData.cst_saida.trim(),
        modalidade_bc_icms: formData.modalidade_bc_icms.trim(),
        aliquota_icms: formData.aliquota_icms
          ? Number(formData.aliquota_icms)
          : undefined,
        aliquota_ipi: formData.aliquota_ipi
          ? Number(formData.aliquota_ipi)
          : undefined,
        aliquota_pis: formData.aliquota_pis
          ? Number(formData.aliquota_pis)
          : undefined,
        aliquota_cofins: formData.aliquota_cofins
          ? Number(formData.aliquota_cofins)
          : undefined,
        cst_pis: formData.cst_pis.trim(),
        cst_cofins: formData.cst_cofins.trim(),
        credito_presumido: formData.credito_presumido.trim(),
        categoria_tributaria: formData.categoria_tributaria.trim(),
        cbs: formData.cbs ? Number(formData.cbs) : undefined,
        ibs: formData.ibs ? Number(formData.ibs) : undefined,
        ii: formData.ii ? Number(formData.ii) : undefined,
        afrmm_fmm: formData.afrmm_fmm.trim(),
        preco_custo: formData.preco_custo
          ? Number(formData.preco_custo)
          : undefined,
        margem_lucro: formData.margem_lucro
          ? Number(formData.margem_lucro)
          : undefined,
        preco_venda: formData.preco_venda
          ? Number(formData.preco_venda)
          : undefined,
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
        pis: formData.pis ? Number(formData.pis) : undefined,
        cofins: formData.cofins ? Number(formData.cofins) : undefined,
      };
      if (editingProduct) {
        await updateProduto({ id: editingProduct.id, data: productData });
        setSuccess("Produto atualizado com sucesso!");
      } else {
        await createProduto(productData);
        setSuccess("Produto cadastrado com sucesso!");
      }
      handleCancel();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowAddDialog(false);
    setFormData({
      codigo: "",
      codigo_barras: "",
      descricao: "",
      descricao_fiscal: "",
      grupo: "",
      ncm: "",
      cest: "",
      origem: "",
      cfop_entrada: "",
      cfop_saida: "",
      cst_entrada: "",
      cst_saida: "",
      modalidade_bc_icms: "",
      aliquota_icms: "",
      aliquota_ipi: "",
      aliquota_pis: "",
      aliquota_cofins: "",
      cst_pis: "",
      cst_cofins: "",
      credito_presumido: "",
      categoria_tributaria: "",
      cbs: "",
      ibs: "",
      ii: "",
      afrmm_fmm: "",
      preco_custo: "",
      margem_lucro: "",
      preco_venda: "",
      estoque_minimo: "",
      estoque_maximo: "",
      estoque_atual: "",
      unidade: "UN",
      controla_estoque: false,
      cfop: "",
      csosn: "",
      cst: "",
      icms: "",
      ativo: true,
      exibir_tela: true,
      solicita_quantidade: false,
      pis: "",
      cofins: "",
    });
    setErrors({});
    setNcmError("");
    setNcmSuccess(false);
    setIsLoadingNcm(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      codigo: product.codigo || "",
      codigo_barras: product.codigo_barras || product.barcode || "",
      descricao: product.descricao || "",
      descricao_fiscal: product.descricao_fiscal || "",
      grupo: product.grupo || "",
      ncm: product.ncm || "",
      cest: product.cest || "",
      origem: product.origem || "",
      cfop_entrada: product.cfop_entrada || "",
      cfop_saida: product.cfop_saida || "",
      cst_entrada: product.cst_entrada || "",
      cst_saida: product.cst_saida || "",
      modalidade_bc_icms: product.modalidade_bc_icms || "",
      aliquota_icms: product.aliquota_icms?.toString() || "",
      aliquota_ipi: product.aliquota_ipi?.toString() || "",
      aliquota_pis: product.aliquota_pis?.toString() || "",
      aliquota_cofins: product.aliquota_cofins?.toString() || "",
      cst_pis: product.cst_pis || "",
      cst_cofins: product.cst_cofins || "",
      credito_presumido: product.credito_presumido || "",
      categoria_tributaria: product.categoria_tributaria || "",
      cbs: product.cbs?.toString() || "",
      ibs: product.ibs?.toString() || "",
      ii: product.ii?.toString() || "",
      afrmm_fmm: product.afrmm_fmm || "",
      preco_custo: product.preco_custo?.toString() || "",
      margem_lucro: product.margem_lucro?.toString() || "",
      preco_venda: product.preco_venda?.toString() || "",
      estoque_minimo: product.estoque_minimo?.toString() || "",
      estoque_maximo: product.estoque_maximo?.toString() || "",
      estoque_atual: product.estoque_atual?.toString() || "",
      unidade: product.unidade || "UN",
      controla_estoque: product.controla_estoque || false,
      cfop: product.cfop || "",
      csosn: product.csosn || "",
      cst: product.cst || "",
      icms: product.icms?.toString() || "",
      ativo: product.ativo !== undefined ? product.ativo : true,
      exibir_tela:
        product.exibir_tela !== undefined ? product.exibir_tela : true,
      solicita_quantidade: product.solicita_quantidade || false,
      pis: product.pis?.toString() || "",
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
      try {
        await deleteProduto(product.id);
        setSuccess("Produto excluído com sucesso!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        console.error("Erro ao excluir produto:", err);
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      codigo: "",
      codigo_barras: "",
      descricao: "",
      descricao_fiscal: "",
      grupo: "",
      ncm: "",
      cest: "",
      origem: "",
      cfop_entrada: "",
      cfop_saida: "",
      cst_entrada: "",
      cst_saida: "",
      modalidade_bc_icms: "",
      aliquota_icms: "",
      aliquota_ipi: "",
      aliquota_pis: "",
      aliquota_cofins: "",
      cst_pis: "",
      cst_cofins: "",
      credito_presumido: "",
      categoria_tributaria: "",
      cbs: "",
      ibs: "",
      ii: "",
      afrmm_fmm: "",
      preco_custo: "",
      margem_lucro: "",
      preco_venda: "",
      estoque_minimo: "",
      estoque_maximo: "",
      estoque_atual: "",
      unidade: "UN",
      controla_estoque: false,
      cfop: "",
      csosn: "",
      cst: "",
      icms: "",
      ativo: true,
      exibir_tela: true,
      solicita_quantidade: false,
      pis: "",
      cofins: "",
    });
    setNcmError("");
    setNcmSuccess(false);
    setIsLoadingNcm(false);
    setShowAddDialog(true);
  };

  // Função para buscar NCM automaticamente
  const buscarNcmAutomatico = async (codigoNcm) => {
    // Remover pontos da máscara para obter apenas os dígitos
    const codigoLimpo = codigoNcm.replace(/\./g, "");

    // Validar se é exatamente 8 dígitos numéricos
    if (
      !codigoLimpo ||
      codigoLimpo.length !== 8 ||
      !/^\d{8}$/.test(codigoLimpo)
    ) {
      setNcmError("");
      setNcmSuccess(false);
      return;
    }

    setIsLoadingNcm(true);
    setNcmError("");
    setNcmSuccess(false);

    try {
      const resultado = await ncmService.buscarNcm(codigoLimpo);

      if (resultado && resultado.ok) {
        // Preencher automaticamente os campos fiscais
        setFormData((prev) => ({
          ...prev,
          descricao_fiscal: resultado.descricao,
          cst: resultado.cst,
          cest: resultado.cest,
          cfop: resultado.cfop,
          origem: resultado.origem,
          csosn: resultado.csosn,
          modalidade_bc_icms: resultado.modalidade_bc_icms,
          aliquota_icms: resultado.aliquota_icms,
          aliquota_ipi: resultado.aliquota_ipi,
          aliquota_pis: resultado.aliquota_pis,
          aliquota_cofins: resultado.aliquota_cofins,
          cst_pis: resultado.cst_pis,
          cst_cofins: resultado.cst_cofins,
          // Mapear CFOP para entrada e saída
          cfop_entrada: resultado.cfop,
          cfop_saida: resultado.cfop,
          // Mapear CST para entrada e saída
          cst_entrada: resultado.cst,
          cst_saida: resultado.cst,
        }));
        setNcmError("");
        setNcmSuccess(true);
      } else {
        setNcmError(resultado?.mensagem || "NCM não encontrado");
        setNcmSuccess(false);
      }
    } catch (error) {
      console.error("Erro ao buscar NCM:", error);
      setNcmError("Erro ao buscar NCM. Tente novamente.");
      setNcmSuccess(false);
    } finally {
      setIsLoadingNcm(false);
    }
  };

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
                      return (
                        <Card key={product.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {product.descricao || product.name}
                                </h3>
                                {product.controla_estoque && (
                                  <Scale
                                    className="w-4 h-4 text-orange-600"
                                    title="Controla estoque"
                                  />
                                )}
                                <Badge variant="secondary">
                                  {product.grupo || product.category}
                                </Badge>
                                {product.aliquota_icms && (
                                  <Badge variant="outline" className="text-xs">
                                    ICMS {product.aliquota_icms}%
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Preço</p>
                                  <p className="font-semibold text-green-600">
                                    R${" "}
                                    {formatPrice(
                                      product.preco_venda || product.price
                                    )}
                                    /{product.unidade || product.unit || "UN"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">
                                    Código de Barras
                                  </p>
                                  <p className="font-mono text-xs">
                                    {product.codigo_barras || product.barcode}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Código</p>
                                  <p className="font-mono text-xs">
                                    {product.codigo}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Estoque</p>
                                  <p>
                                    {product.controla_estoque
                                      ? `${Number(
                                          product.estoque_atual || 0
                                        )} ${product.unidade || "UN"}`
                                      : "Não controlado"}
                                  </p>
                                </div>
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

          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
              <TabsTrigger value="fiscal">Informações Fiscais</TabsTrigger>
            </TabsList>
            <TabsContent value="geral">
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informações Básicas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="codigo">Código Interno *</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) =>
                          setFormData({ ...formData, codigo: e.target.value })
                        }
                        placeholder="Código interno"
                        className={formErrors.codigo ? "border-red-500" : ""}
                      />
                      {formErrors.codigo && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.codigo}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="codigo_barras">Código de Barras *</Label>
                      <Input
                        id="codigo_barras"
                        value={formData.codigo_barras}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            codigo_barras: e.target.value,
                          })
                        }
                        placeholder="Ex: 7894900011517"
                        className={
                          formErrors.codigo_barras ? "border-red-500" : ""
                        }
                      />
                      {formErrors.codigo_barras && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.codigo_barras}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Input
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descricao: e.target.value,
                          })
                        }
                        placeholder="Descrição detalhada do produto"
                        className={formErrors.descricao ? "border-red-500" : ""}
                      />
                      {formErrors.descricao && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.descricao}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="grupo">Grupo *</Label>
                      <Input
                        id="grupo"
                        value={formData.grupo}
                        onChange={(e) =>
                          setFormData({ ...formData, grupo: e.target.value })
                        }
                        placeholder="Grupo do produto"
                        className={formErrors.grupo ? "border-red-500" : ""}
                      />
                      {formErrors.grupo && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.grupo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Separator />
                {/* Informações de Preço */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Informações de Preço
                  </h3>
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
                          setFormData({
                            ...formData,
                            preco_custo: e.target.value,
                          })
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
                          setFormData({
                            ...formData,
                            margem_lucro: e.target.value,
                          })
                        }
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preco_venda">Preço de Venda *</Label>
                      <Input
                        id="preco_venda"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.preco_venda}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preco_venda: e.target.value,
                          })
                        }
                        placeholder="0,00"
                        className={
                          formErrors.preco_venda ? "border-red-500" : ""
                        }
                      />
                      {formErrors.preco_venda && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.preco_venda}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Separator />
                {/* Informações de Estoque */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Informações de Estoque
                  </h3>
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
              </div>
            </TabsContent>
            <TabsContent value="fiscal">
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Informações Fiscais</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="descricao_fiscal">
                      Descrição Fiscal Completa
                    </Label>
                    <Input
                      id="descricao_fiscal"
                      value={formData.descricao_fiscal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descricao_fiscal: e.target.value,
                        })
                      }
                      placeholder="Nome, marca, variação, embalagem..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="ncm">NCM (8 dígitos)</Label>
                    <div className="relative">
                      <Input
                        id="ncm"
                        value={formData.ncm}
                        onChange={(e) => {
                          // Aceitar apenas números e pontos
                          let value = e.target.value.replace(/[^\d.]/g, "");

                          // Aplicar máscara NCM: 0000.00.00
                          if (value.length > 0) {
                            // Remover pontos existentes para recalcular
                            value = value.replace(/\./g, "");

                            // Aplicar máscara
                            if (value.length <= 4) {
                              value = value;
                            } else if (value.length <= 6) {
                              value = value.slice(0, 4) + "." + value.slice(4);
                            } else {
                              value =
                                value.slice(0, 4) +
                                "." +
                                value.slice(4, 6) +
                                "." +
                                value.slice(6, 8);
                            }
                          }

                          // Limitar a 10 caracteres (8 dígitos + 2 pontos)
                          const limitedValue = value.slice(0, 10);
                          setFormData({ ...formData, ncm: limitedValue });
                        }}
                        onBlur={(e) => buscarNcmAutomatico(e.target.value)}
                        placeholder="0000.00.00"
                        maxLength={10}
                        className={`${ncmError ? "border-red-500" : ""} ${
                          ncmSuccess ? "border-green-500" : ""
                        }`}
                      />
                      {isLoadingNcm && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      {ncmSuccess && !isLoadingNcm && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                    {ncmError && (
                      <p className="text-red-500 text-xs mt-1">{ncmError}</p>
                    )}
                    {ncmSuccess && (
                      <p className="text-green-600 text-xs mt-1">
                        NCM encontrado! Campos fiscais preenchidos
                        automaticamente.
                      </p>
                    )}
                    {formData.ncm &&
                      formData.ncm.replace(/\./g, "").length < 8 && (
                        <p className="text-blue-500 text-xs mt-1">
                          Digite os 8 dígitos do NCM (formato: 0000.00.00) para
                          busca automática
                        </p>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="cest">CEST (7 dígitos)</Label>
                    <Input
                      id="cest"
                      value={formData.cest}
                      onChange={(e) =>
                        setFormData({ ...formData, cest: e.target.value })
                      }
                      placeholder="Código CEST"
                    />
                  </div>
                  <div>
                    <Label htmlFor="origem">Origem do Produto</Label>
                    <select
                      id="origem"
                      value={formData.origem}
                      onChange={(e) =>
                        setFormData({ ...formData, origem: e.target.value })
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Selecione...</option>
                      <option value="0">0 - Nacional</option>
                      <option value="1">
                        1 - Estrangeira - Importação direta
                      </option>
                      <option value="2">
                        2 - Estrangeira - Adquirida no mercado interno
                      </option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="cfop_entrada">
                      CFOP Entrada (4 dígitos)
                    </Label>
                    <Input
                      id="cfop_entrada"
                      value={formData.cfop_entrada}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cfop_entrada: e.target.value,
                        })
                      }
                      placeholder="CFOP Entrada"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cfop_saida">CFOP Saída (4 dígitos)</Label>
                    <Input
                      id="cfop_saida"
                      value={formData.cfop_saida}
                      onChange={(e) =>
                        setFormData({ ...formData, cfop_saida: e.target.value })
                      }
                      placeholder="CFOP Saída"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cst_entrada">CST/CSOSN Entrada</Label>
                    <Input
                      id="cst_entrada"
                      value={formData.cst_entrada}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cst_entrada: e.target.value,
                        })
                      }
                      placeholder="CST/CSOSN Entrada"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cst_saida">CST/CSOSN Saída</Label>
                    <Input
                      id="cst_saida"
                      value={formData.cst_saida}
                      onChange={(e) =>
                        setFormData({ ...formData, cst_saida: e.target.value })
                      }
                      placeholder="CST/CSOSN Saída"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modalidade_bc_icms">
                      Modalidade BC ICMS
                    </Label>
                    <Input
                      id="modalidade_bc_icms"
                      value={formData.modalidade_bc_icms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          modalidade_bc_icms: e.target.value,
                        })
                      }
                      placeholder="Margem, Pauta, Valor da Operação..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="aliquota_icms">Alíquota ICMS (%)</Label>
                    <Input
                      id="aliquota_icms"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.aliquota_icms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aliquota_icms: e.target.value,
                        })
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aliquota_ipi">Alíquota IPI (%)</Label>
                    <Input
                      id="aliquota_ipi"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.aliquota_ipi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aliquota_ipi: e.target.value,
                        })
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aliquota_pis">Alíquota PIS (%)</Label>
                    <Input
                      id="aliquota_pis"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.aliquota_pis}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aliquota_pis: e.target.value,
                        })
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aliquota_cofins">Alíquota COFINS (%)</Label>
                    <Input
                      id="aliquota_cofins"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.aliquota_cofins}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aliquota_cofins: e.target.value,
                        })
                      }
                      placeholder="0,00"
                    />
                  </div>
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
                    <Label htmlFor="credito_presumido">
                      Crédito Presumido (código/%):
                    </Label>
                    <Input
                      id="credito_presumido"
                      value={formData.credito_presumido}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          credito_presumido: e.target.value,
                        })
                      }
                      placeholder="Código ou percentual"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria_tributaria">
                      Categoria Tributária / CNAE
                    </Label>
                    <Input
                      id="categoria_tributaria"
                      value={formData.categoria_tributaria}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoria_tributaria: e.target.value,
                        })
                      }
                      placeholder="Categoria tributária ou CNAE"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cbs">CBS (%) (futuro)</Label>
                    <Input
                      id="cbs"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cbs}
                      onChange={(e) =>
                        setFormData({ ...formData, cbs: e.target.value })
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ibs">IBS (%) (futuro)</Label>
                    <Input
                      id="ibs"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.ibs}
                      onChange={(e) =>
                        setFormData({ ...formData, ibs: e.target.value })
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ii">II (%) (Importação)</Label>
                    <Input
                      id="ii"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.ii}
                      onChange={(e) =>
                        setFormData({ ...formData, ii: e.target.value })
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="afrmm_fmm">AFRMM/FMM (Importação)</Label>
                    <Input
                      id="afrmm_fmm"
                      value={formData.afrmm_fmm}
                      onChange={(e) =>
                        setFormData({ ...formData, afrmm_fmm: e.target.value })
                      }
                      placeholder="Taxa logística"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {editingProduct ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CSVImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        products={products}
        onImportComplete={() => fetchProdutos()}
      />
    </div>
  );
}
