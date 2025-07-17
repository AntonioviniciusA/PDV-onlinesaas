import { useRef, useEffect, useState } from "react";
import JsBarcode from "jsbarcode";
import { etiquetaService } from "./services/etiquetaService";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import { ScrollArea } from "./components/ui/scroll-area";
import { Badge } from "./components/ui/badge";
import { Alert, AlertDescription } from "./components/ui/alert";
import {
  ArrowLeft,
  Scan,
  Printer,
  Plus,
  Minus,
  Trash2,
  Eye,
  Scale,
  Package,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Settings,
} from "lucide-react";
import { calculateComparativePrice } from "./components/unit-converter.js";
import { LabelConfigDialog } from "./components/label-config-dialog.jsx";
import { BtnVoltarPDV } from "./components/BtnVoltarPDV.jsx";

export default function EtiquetasPreco({ products }) {
  const [loading, setLoading] = useState(true);
  const [printList, setPrintList] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const barcodeInputRef = useRef(null);

  const [templates, setTemplates] = useState([]); // Todos os templates do backend
  const [currentTemplate, setCurrentTemplate] = useState(null); // Template selecionado
  const [templateId, setTemplateId] = useState(null);
  // Carregar templates do backend ao montar
  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const allTemplates = await etiquetaService.listEtiquetaTemplates();
        setTemplates(allTemplates);
        // Seleciona o primeiro como padrão, ou o mais recente salvo
        if (allTemplates.length > 0) {
          setCurrentTemplate({
            ...allTemplates[0],
            fontSize: {
              name: allTemplates[0].fonte_nome,
              price: allTemplates[0].fonte_preco,
              comparison: allTemplates[0].fonte_comparacao,
              barcode: allTemplates[0].fonte_barcode,
            },
            colors: {
              background: allTemplates[0].cor_fundo,
              text: allTemplates[0].cor_texto,
              price: allTemplates[0].cor_preco,
              comparison: allTemplates[0].cor_comparacao,
            },
            mostrar_comparacao: !!allTemplates[0].mostrar_comparacao,
            mostrar_icms: !!allTemplates[0].mostrar_icms,
            mostrar_codigo_de_barra: !!allTemplates[0].mostrar_codigo_de_barra,
          });
          setTemplateId(allTemplates[0].id);
        }
      } catch (err) {
        setError("Erro ao carregar templates de etiqueta");
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  // Permitir seleção de template na interface
  const handleSelectTemplate = (id) => {
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      setCurrentTemplate({
        ...tpl,
        fontSize: {
          name: tpl.fonte_nome,
          price: tpl.fonte_preco,
          comparison: tpl.fonte_comparacao,
          barcode: tpl.fonte_barcode,
        },
        colors: {
          background: tpl.cor_fundo,
          text: tpl.cor_texto,
          price: tpl.cor_preco,
          comparison: tpl.cor_comparacao,
        },
        mostrar_comparacao: !!tpl.mostrar_comparacao,
        mostrar_icms: !!tpl.mostrar_icms,
        mostrar_codigo_de_barra: !!tpl.mostrar_codigo_de_barra,
      });
      setTemplateId(tpl.id);
    }
  };

  // Focar no input ao carregar a página
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const product = products.find((p) => p.barcode === barcode.trim());

    if (!product) {
      setError(`Produto com código "${barcode}" não encontrado`);
      setTimeout(() => setError(""), 3000);
      setBarcode("");
      return;
    }

    // Verificar se produto já está na lista
    const existingItem = printList.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      // Aumentar quantidade
      setPrintList((prev) =>
        prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Adicionar novo item
      setPrintList((prev) => [...prev, { product, quantity: 1 }]);
    }

    setSuccess(`"${product.name}" adicionado à lista`);
    setTimeout(() => setSuccess(""), 2000);
    setBarcode("");
    barcodeInputRef.current?.focus();
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setPrintList((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    } else {
      setPrintList((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (productId) => {
    setPrintList((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  };

  const clearList = () => {
    if (window.confirm("Tem certeza que deseja limpar toda a lista?")) {
      setPrintList([]);
    }
  };

  const handlePrint = () => {
    if (printList.length === 0) {
      setError("Adicione produtos à lista antes de imprimir");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Simular impressão
    const totalLabels = printList.reduce((sum, item) => sum + item.quantity, 0);
    alert(
      `Imprimindo ${totalLabels} etiquetas...\n\nEsta é uma simulação. Em um sistema real, as etiquetas seriam enviadas para a impressora.`
    );

    // Limpar lista após impressão
    setPrintList([]);
    setSuccess("Etiquetas enviadas para impressão!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const totalLabels = printList.reduce((sum, item) => sum + item.quantity, 0);

  // Função para renderizar a etiqueta de cada produto
  function Etiqueta({ product, template }) {
    const barcodeRef = useRef();

    useEffect(() => {
      if (template.mostrar_icms && barcodeRef.current) {
        JsBarcode(
          barcodeRef.current,
          product.barcode || product.codigo || product.id,
          {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: false,
          }
        );
      }
    }, [template.mostrar_icms, product.barcode, product.codigo, product.id]);

    return (
      <div className="etiqueta">
        {/* ...outros elementos da etiqueta... */}
        {template.mostrar_icms && <svg ref={barcodeRef}></svg>}
      </div>
    );
  }

  // Função para imprimir na Zebra
  function imprimirZebra(item) {
    if (!window.BrowserPrint) {
      alert("Zebra Browser Print não está disponível. Verifique a instalação.");
      return;
    }
    window.BrowserPrint.getDefaultDevice("printer", function (device) {
      if (!device) {
        alert("Nenhuma impressora Zebra encontrada.");
        return;
      }
      // Exemplo de comando ZPL (ajuste conforme sua etiqueta)
      const zpl = `^XA^FO20,20^A0N,30,30^FD${
        item.product.name
      }^FS^FO20,60^BY2^BCN,60,Y,N,N^FD${
        item.product.barcode || item.product.codigo || item.product.id
      }^FS^XZ`;
      device.send(zpl, undefined, function (err) {
        if (err) {
          alert("Erro ao imprimir: " + err);
        } else {
          alert("Etiqueta enviada para a impressora!");
        }
      });
    });
  }

  // Exemplo de uso:
  // <Etiqueta product={item.product} template={template} />

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BtnVoltarPDV />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Etiquetas de Preço
              </h1>
              <p className="text-sm text-gray-600">
                Gerar etiquetas para produtos
              </p>
            </div>
            <Button
              onClick={() => setIsConfigModalOpen(true)}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Config. Etiquetas</span>
            </Button>
          </div>
          <div className="flex gap-2">
            {printList.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? "Ocultar" : "Visualizar"}
                </Button>
                <Button
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir ({totalLabels})
                </Button>
                <Button
                  onClick={() => imprimirZebra(printList[0])}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir na Zebra
                </Button>
                <Button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Etiquetas
                </Button>
              </>
            )}
          </div>
          {/* Seletor de template */}
          {templates.length > 0 && (
            <div className="flex items-center gap-2">
              <Label htmlFor="template-select">Template:</Label>
              <select
                id="template-select"
                value={templateId || ""}
                onChange={(e) => handleSelectTemplate(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className="flex-shrink-0 p-4">
          <div className="max-w-7xl mx-auto">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Scanner */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  Scanner de Código de Barras
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="barcode">Código de Barras</Label>
                    <Input
                      ref={barcodeInputRef}
                      id="barcode"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Escaneie ou digite o código de barras..."
                      className="text-lg font-mono"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Escaneie o código de barras ou digite manualmente e
                      pressione Enter
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!barcode.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar à Lista
                  </Button>
                </form>

                <Separator className="my-6" />

                {/* Estatísticas */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Resumo</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600">Produtos na Lista</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {printList.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-600">Total de Etiquetas</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {totalLabels}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instruções */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Como usar:
                  </h3>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Escaneie ou digite o código de barras</li>
                    <li>
                      2. O produto será adicionado à lista automaticamente
                    </li>
                    <li>3. Ajuste a quantidade se necessário</li>
                    <li>4. Clique em "Imprimir" quando terminar</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Impressão */}
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Lista de Impressão ({printList.length})
                  </CardTitle>
                  {printList.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearList}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar Lista
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {printList.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Scan className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum produto na lista</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Escaneie códigos de barras para adicionar produtos
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {printList.map((item) => {
                        const hasComparison =
                          item.product.quantity &&
                          item.product.measureUnit &&
                          item.product.quantity > 0;
                        const comparison = hasComparison
                          ? calculateComparativePrice(
                              item.product.price,
                              item.product.quantity,
                              item.product.measureUnit
                            )
                          : null;

                        return (
                          <Card key={item.product.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm">
                                    {item.product.name}
                                  </h3>
                                  {item.product.requiresWeight && (
                                    <Scale
                                      className="w-3 h-3 text-orange-600"
                                      title="Produto por peso"
                                    />
                                  )}
                                  {comparison && (
                                    <Calculator
                                      className="w-3 h-3 text-blue-600"
                                      title="Com comparação de preço"
                                    />
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {item.product.category}
                                  </Badge>
                                  {item.product.icms && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      ICMS {item.product.icms}%
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <p>Código: {item.product.barcode}</p>
                                  <p className="font-semibold text-green-600">
                                    R$ {item.product.price.toFixed(2)}
                                    {item.product.requiresWeight
                                      ? "/kg"
                                      : `/${item.product.unit}`}
                                  </p>
                                  {comparison && comparison.comparison && (
                                    <p className="font-semibold text-blue-600">
                                      {comparison.comparison}
                                    </p>
                                  )}
                                  {hasComparison && (
                                    <p className="text-gray-400">
                                      {item.product.quantity}{" "}
                                      {item.product.measureUnit}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateQuantity(
                                        item.product.id,
                                        item.quantity - 1
                                      )
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm font-semibold">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateQuantity(
                                        item.product.id,
                                        item.quantity + 1
                                      )
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeItem(item.product.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview das Etiquetas */}
          {showPreview && printList.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview das Etiquetas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {printList.map((item) => {
                    const hasComparison =
                      item.product.quantity &&
                      item.product.measureUnit &&
                      item.product.quantity > 0;
                    const comparison = hasComparison
                      ? calculateComparativePrice(
                          item.product.price,
                          item.product.quantity,
                          item.product.measureUnit
                        )
                      : null;

                    return Array.from({ length: item.quantity }).map(
                      (_, index) => (
                        <div
                          key={`${item.product.id}-${index}`}
                          className="border-2 border-dashed border-gray-300 p-3 bg-white text-center"
                          style={{ width: "140px", height: "100px" }}
                        >
                          <div className="text-xs font-bold truncate mb-1">
                            {item.product.name}
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            R$ {item.product.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.product.requiresWeight
                              ? "/kg"
                              : `/${item.product.unit}`}
                          </div>
                          {comparison && comparison.comparison && (
                            <div className="text-xs text-blue-600 font-semibold mt-1">
                              {comparison.comparison}
                            </div>
                          )}
                          {item.product.icms && (
                            <div className="text-xs text-gray-500 mt-1">
                              ICMS {item.product.icms}%
                            </div>
                          )}
                          <div className="text-xs font-mono mt-1">
                            {item.product.barcode}
                          </div>
                        </div>
                      )
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Preview das etiquetas que serão impressas. Tamanho real: 140mm
                  × 100mm
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Label Config Modal */}
      <LabelConfigDialog
        open={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        currentTemplate={currentTemplate}
        onSave={(newTemplate) => {
          setCurrentTemplate(newTemplate);
          setIsConfigModalOpen(false);
        }}
        templateId={templateId}
        setTemplateId={setTemplateId}
      />
    </div>
  );
}
