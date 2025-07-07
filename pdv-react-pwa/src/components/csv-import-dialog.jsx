"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export function CSVImportDialog({
  open,
  onOpenChange,
  products,
  onImportComplete,
}) {
  const [step, setStep] = useState("upload");
  const [csvData, setCsvData] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const csvTemplate = `nome,preco,categoria,codigo_barras,por_peso,unidade
Coca-Cola 350ml,4.50,Bebidas,7894900011517,nao,un
Pão Francês,8.90,Padaria,2000000000001,sim,kg
Leite Integral 1L,5.20,Laticínios,7891000100103,nao,un
Banana Prata,5.50,Frutas,2000000000002,sim,kg`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_produtos.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateRow = useCallback(
    (row, index) => {
      const errors = [];

      // Validar nome
      if (!row.nome || row.nome.trim() === "") {
        errors.push("Nome é obrigatório");
      }

      // Validar preço
      const price = Number.parseFloat(row.preco?.toString().replace(",", "."));
      if (isNaN(price) || price <= 0) {
        errors.push("Preço deve ser um número maior que zero");
      }

      // Validar categoria
      if (!row.categoria || row.categoria.trim() === "") {
        errors.push("Categoria é obrigatória");
      }

      // Validar código de barras
      if (!row.codigo_barras || row.codigo_barras.toString().length < 8) {
        errors.push("Código de barras deve ter pelo menos 8 dígitos");
      }

      // Verificar duplicata no CSV atual
      const existingInFile = csvData.find(
        (item) =>
          item.barcode === row.codigo_barras?.toString() &&
          item.rowIndex !== index
      );
      if (existingInFile) {
        errors.push("Código de barras duplicado no arquivo");
      }

      // Verificar duplicata nos produtos existentes
      const existingProduct = products.find(
        (p) => p.barcode === row.codigo_barras?.toString()
      );
      if (existingProduct && !allowDuplicates) {
        errors.push("Código de barras já existe no sistema");
      }

      const requiresWeight = row.por_peso?.toString().toLowerCase() === "sim";
      const unit = requiresWeight ? "kg" : row.unidade || "un";

      return {
        name: row.nome?.toString().trim() || "",
        price: row.preco?.toString() || "",
        category: row.categoria?.toString().trim() || "",
        barcode: row.codigo_barras?.toString() || "",
        requiresWeight: row.por_peso?.toString() || "nao",
        unit: unit,
        rowIndex: index,
        errors,
        isValid: errors.length === 0,
      };
    },
    [csvData, products, allowDuplicates]
  );

  const parseCSV = useCallback(
    (text) => {
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) return [];

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || "";
        });

        const validatedRow = validateRow(row, i);
        rows.push(validatedRow);
      }

      return rows;
    },
    [validateRow]
  );

  const handleFileUpload = useCallback(
    (file) => {
      if (!file.name.endsWith(".csv")) {
        alert("Por favor, selecione um arquivo CSV");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        try {
          const parsedData = parseCSV(text);
          setCsvData(parsedData);
          setStep("preview");
        } catch (error) {
          alert("Erro ao processar arquivo CSV. Verifique o formato.");
        }
      };
      reader.readAsText(file, "UTF-8");
    },
    [parseCSV]
  );

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    },
    [handleFileUpload]
  );

  const processImport = async () => {
    setIsProcessing(true);

    const result = {
      success: 0,
      errors: 0,
      duplicates: 0,
      details: [],
    };

    const newProducts = [...products];

    for (const row of csvData) {
      if (!row.isValid) {
        result.errors++;
        result.details.push({
          row: row.rowIndex,
          name: row.name,
          status: "error",
          message: row.errors.join(", "),
        });
        continue;
      }

      // Verificar se já existe
      const existingIndex = newProducts.findIndex(
        (p) => p.barcode === row.barcode
      );

      if (existingIndex >= 0) {
        if (allowDuplicates) {
          // Sobrescrever produto existente
          newProducts[existingIndex] = {
            id: newProducts[existingIndex].id,
            name: row.name,
            price: Number.parseFloat(row.price.replace(",", ".")),
            category: row.category,
            barcode: row.barcode,
            requiresWeight: row.requiresWeight.toLowerCase() === "sim",
            unit: row.unit,
          };
          result.success++;
          result.details.push({
            row: row.rowIndex,
            name: row.name,
            status: "success",
            message: "Produto atualizado",
          });
        } else {
          result.duplicates++;
          result.details.push({
            row: row.rowIndex,
            name: row.name,
            status: "duplicate",
            message: "Código de barras já existe",
          });
        }
      } else {
        // Adicionar novo produto
        const newProduct = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: row.name,
          price: Number.parseFloat(row.price.replace(",", ".")),
          category: row.category,
          barcode: row.barcode,
          requiresWeight: row.requiresWeight.toLowerCase() === "sim",
          unit: row.unit,
        };

        newProducts.push(newProduct);
        result.success++;
        result.details.push({
          row: row.rowIndex,
          name: row.name,
          status: "success",
          message: "Produto adicionado",
        });
      }
    }

    setImportResult(result);
    onImportComplete(newProducts);
    setIsProcessing(false);
    setStep("result");
  };

  const resetDialog = () => {
    setStep("upload");
    setCsvData([]);
    setImportResult(null);
    setIsProcessing(false);
    setAllowDuplicates(false);
    setDragActive(false);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const validRows = csvData.filter((row) => row.isValid).length;
  const errorRows = csvData.filter((row) => !row.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Produtos via CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="mb-4 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Template CSV
                </Button>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Arraste o arquivo CSV aqui ou clique para selecionar
                </h3>
                <p className="text-gray-500 mb-4">
                  Formato suportado: CSV com colunas: nome, preco, categoria,
                  codigo_barras, por_peso, unidade
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileUpload(e.target.files[0])
                  }
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  Selecionar Arquivo CSV
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Formato do CSV:</strong>
                  <br />• Primeira linha deve conter os cabeçalhos
                  <br />• Colunas: nome, preco, categoria, codigo_barras,
                  por_peso (sim/nao), unidade
                  <br />• Use vírgula como separador
                  <br />• Codificação UTF-8
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    {csvData.length} linhas encontradas
                  </Badge>
                  <Badge variant={validRows > 0 ? "default" : "secondary"}>
                    {validRows} válidas
                  </Badge>
                  {errorRows > 0 && (
                    <Badge variant="destructive">{errorRows} com erro</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowDuplicates"
                    checked={allowDuplicates}
                    onChange={(e) => setAllowDuplicates(e.target.checked)}
                  />
                  <Label htmlFor="allowDuplicates" className="text-sm">
                    Sobrescrever produtos existentes
                  </Label>
                </div>
              </div>

              <ScrollArea className="h-96 border rounded-lg">
                <div className="p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Linha</th>
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Preço</th>
                        <th className="text-left p-2">Categoria</th>
                        <th className="text-left p-2">Código</th>
                        <th className="text-left p-2">Peso</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((row, index) => (
                        <tr
                          key={index}
                          className={`border-b ${
                            !row.isValid ? "bg-red-50" : ""
                          }`}
                        >
                          <td className="p-2">{row.rowIndex}</td>
                          <td className="p-2">{row.name}</td>
                          <td className="p-2">R$ {row.price}</td>
                          <td className="p-2">{row.category}</td>
                          <td className="p-2 font-mono text-xs">
                            {row.barcode}
                          </td>
                          <td className="p-2">
                            {row.requiresWeight === "sim" ? "Sim" : "Não"}
                          </td>
                          <td className="p-2">
                            {row.isValid ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-xs text-red-600">
                                  {row.errors[0]}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setStep("upload")}>
                  Voltar
                </Button>
                <Button
                  onClick={processImport}
                  disabled={validRows === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>Importar {validRows} Produtos</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === "result" && importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {importResult.success}
                  </p>
                  <p className="text-sm text-green-700">Importados</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {importResult.errors}
                  </p>
                  <p className="text-sm text-red-700">Erros</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">
                    {importResult.duplicates}
                  </p>
                  <p className="text-sm text-yellow-700">Duplicados</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Detalhes da Importação:</h3>
                <ScrollArea className="h-64 border rounded-lg">
                  <div className="p-4 space-y-2">
                    {importResult.details.map((detail, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 border rounded"
                      >
                        {detail.status === "success" && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {detail.status === "error" && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        {detail.status === "duplicate" && (
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{detail.name}</p>
                          <p className="text-xs text-gray-500">
                            Linha {detail.row}: {detail.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetDialog}>
                  Importar Mais
                </Button>
                <Button onClick={handleClose}>Concluir</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
