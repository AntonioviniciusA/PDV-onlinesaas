"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import {
  Printer,
  Save,
  TestTube,
  Monitor,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

// Configurações padrão de impressora
const DEFAULT_PRINTER_CONFIG = {
  // Impressora
  printerName: "",
  printerType: "thermal", // thermal, laser, inkjet
  printerBrand: "",
  printerModel: "",

  // Configurações de papel
  paperWidth: 80, // mm
  paperHeight: 297, // mm (A4)
  paperType: "thermal", // thermal, plain, photo

  // Margens e espaçamento
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 5,
  marginRight: 5,
  lineSpacing: 1.2,

  // Configurações de impressão
  printQuality: "normal", // draft, normal, high
  printSpeed: "normal", // slow, normal, fast
  autoCut: true,
  autoFeed: true,

  // Configurações de texto
  fontSize: 12,
  fontFamily: "monospace",
  boldHeaders: true,
  centerAlign: true,

  // Configurações específicas
  showLogo: true,
  showHeader: true,
  showFooter: true,
  showBarcode: true,
  showQRCode: false,

  // Configurações de teste
  testPrint: false,
  previewMode: false,
};

// Tipos de impressora suportados
const PRINTER_TYPES = [
  { id: "thermal", name: "Térmica", icon: "🔥" },
  { id: "laser", name: "Laser", icon: "⚡" },
  { id: "inkjet", name: "Jato de Tinta", icon: "💧" },
  { id: "dot_matrix", name: "Matricial", icon: "🔢" },
];

// Tipos de papel
const PAPER_TYPES = [
  { id: "thermal", name: "Papel Térmico" },
  { id: "plain", name: "Papel Comum" },
  { id: "photo", name: "Papel Fotográfico" },
  { id: "label", name: "Etiquetas" },
];

// Qualidades de impressão
const PRINT_QUALITIES = [
  { id: "draft", name: "Rascunho" },
  { id: "normal", name: "Normal" },
  { id: "high", name: "Alta Qualidade" },
];

// Velocidades de impressão
const PRINT_SPEEDS = [
  { id: "slow", name: "Lenta" },
  { id: "normal", name: "Normal" },
  { id: "fast", name: "Rápida" },
];

export function PrinterConfigDialog({ open, onOpenChange, config, onSave }) {
  const [printerConfig, setPrinterConfig] = useState(
    config || DEFAULT_PRINTER_CONFIG
  );
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Detectar impressoras disponíveis
  const detectPrinters = async () => {
    setIsDetecting(true);
    setTestResult(null);

    try {
      // Simular detecção de impressoras (em produção, usar API real)
      const mockPrinters = [
        {
          name: "Zebra ZD420",
          type: "thermal",
          brand: "Zebra",
          model: "ZD420",
        },
        {
          name: "Epson TM-T20",
          type: "thermal",
          brand: "Epson",
          model: "TM-T20",
        },
        {
          name: "HP LaserJet Pro",
          type: "laser",
          brand: "HP",
          model: "LaserJet Pro",
        },
        { name: "Canon PIXMA", type: "inkjet", brand: "Canon", model: "PIXMA" },
      ];

      // Simular delay de detecção
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setAvailablePrinters(mockPrinters);
      setTestResult({
        type: "success",
        message: `${mockPrinters.length} impressoras detectadas`,
      });
    } catch (error) {
      setTestResult({ type: "error", message: "Erro ao detectar impressoras" });
    } finally {
      setIsDetecting(false);
    }
  };

  // Teste de impressão
  const testPrint = async () => {
    setTestResult(null);

    try {
      // Simular teste de impressão
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const testData = {
        printer: printerConfig.printerName,
        timestamp: new Date().toLocaleString(),
        content: "Teste de impressão - PDV System",
      };

      // Em produção, enviar para impressora real
      console.log("Teste de impressão:", testData);

      setTestResult({
        type: "success",
        message: "Teste de impressão enviado com sucesso!",
      });
    } catch (error) {
      setTestResult({
        type: "error",
        message: "Erro ao enviar teste de impressão",
      });
    }
  };

  // Salvar configurações
  const handleSave = () => {
    onSave(printerConfig);
    onOpenChange(false);
  };

  // Atualizar configuração
  const updateConfig = (updates) => {
    setPrinterConfig((prev) => ({ ...prev, ...updates }));
  };

  // Selecionar impressora
  const selectPrinter = (printer) => {
    updateConfig({
      printerName: printer.name,
      printerType: printer.type,
      printerBrand: printer.brand,
      printerModel: printer.model,
    });
  };

  useEffect(() => {
    if (open) {
      detectPrinters();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="printer-config-dialog-description"
      >
        <DialogDescription id="printer-config-dialog-description">
          Configure as impressoras do sistema.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Configuração de Impressora
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda - Configurações Gerais */}
          <div className="space-y-6">
            {/* Detecção de Impressoras */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Impressoras Disponíveis
              </h3>

              <div className="space-y-3">
                <Button
                  onClick={detectPrinters}
                  disabled={isDetecting}
                  variant="outline"
                  className="w-full"
                >
                  {isDetecting ? "Detectando..." : "Detectar Impressoras"}
                </Button>

                {availablePrinters.length > 0 && (
                  <div className="space-y-2">
                    {availablePrinters.map((printer, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          printerConfig.printerName === printer.name
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => selectPrinter(printer)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{printer.name}</p>
                            <p className="text-sm text-gray-600">
                              {printer.brand} {printer.model}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {
                              PRINTER_TYPES.find((t) => t.id === printer.type)
                                ?.name
                            }
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Configurações de Papel */}
            <div>
              <h3 className="font-semibold mb-3">Configurações de Papel</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="paperWidth">Largura (mm)</Label>
                  <Input
                    id="paperWidth"
                    type="number"
                    value={printerConfig.paperWidth}
                    onChange={(e) =>
                      updateConfig({ paperWidth: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="paperHeight">Altura (mm)</Label>
                  <Input
                    id="paperHeight"
                    type="number"
                    value={printerConfig.paperHeight}
                    onChange={(e) =>
                      updateConfig({ paperHeight: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="mt-3">
                <Label htmlFor="paperType">Tipo de Papel</Label>
                <Select
                  value={printerConfig.paperType}
                  onValueChange={(value) => updateConfig({ paperType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Margens */}
            <div>
              <h3 className="font-semibold mb-3">Margens (mm)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="marginTop">Superior</Label>
                  <Input
                    id="marginTop"
                    type="number"
                    value={printerConfig.marginTop}
                    onChange={(e) =>
                      updateConfig({ marginTop: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="marginBottom">Inferior</Label>
                  <Input
                    id="marginBottom"
                    type="number"
                    value={printerConfig.marginBottom}
                    onChange={(e) =>
                      updateConfig({ marginBottom: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="marginLeft">Esquerda</Label>
                  <Input
                    id="marginLeft"
                    type="number"
                    value={printerConfig.marginLeft}
                    onChange={(e) =>
                      updateConfig({ marginLeft: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="marginRight">Direita</Label>
                  <Input
                    id="marginRight"
                    type="number"
                    value={printerConfig.marginRight}
                    onChange={(e) =>
                      updateConfig({ marginRight: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Configurações Avançadas */}
          <div className="space-y-6">
            {/* Configurações de Impressão */}
            <div>
              <h3 className="font-semibold mb-3">Configurações de Impressão</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="printQuality">Qualidade</Label>
                  <Select
                    value={printerConfig.printQuality}
                    onValueChange={(value) =>
                      updateConfig({ printQuality: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRINT_QUALITIES.map((quality) => (
                        <SelectItem key={quality.id} value={quality.id}>
                          {quality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="printSpeed">Velocidade</Label>
                  <Select
                    value={printerConfig.printSpeed}
                    onValueChange={(value) =>
                      updateConfig({ printSpeed: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRINT_SPEEDS.map((speed) => (
                        <SelectItem key={speed.id} value={speed.id}>
                          {speed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Opções de Impressão */}
            <div>
              <h3 className="font-semibold mb-3">Opções de Impressão</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoCut">Corte Automático</Label>
                  <Switch
                    id="autoCut"
                    checked={printerConfig.autoCut}
                    onCheckedChange={(checked) =>
                      updateConfig({ autoCut: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoFeed">Alimentação Automática</Label>
                  <Switch
                    id="autoFeed"
                    checked={printerConfig.autoFeed}
                    onCheckedChange={(checked) =>
                      updateConfig({ autoFeed: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="boldHeaders">Cabeçalhos em Negrito</Label>
                  <Switch
                    id="boldHeaders"
                    checked={printerConfig.boldHeaders}
                    onCheckedChange={(checked) =>
                      updateConfig({ boldHeaders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="centerAlign">Centralizar Texto</Label>
                  <Switch
                    id="centerAlign"
                    checked={printerConfig.centerAlign}
                    onCheckedChange={(checked) =>
                      updateConfig({ centerAlign: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Configurações de Conteúdo */}
            <div>
              <h3 className="font-semibold mb-3">Conteúdo do Comprovante</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLogo">Mostrar Logo</Label>
                  <Switch
                    id="showLogo"
                    checked={printerConfig.showLogo}
                    onCheckedChange={(checked) =>
                      updateConfig({ showLogo: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showHeader">Mostrar Cabeçalho</Label>
                  <Switch
                    id="showHeader"
                    checked={printerConfig.showHeader}
                    onCheckedChange={(checked) =>
                      updateConfig({ showHeader: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showFooter">Mostrar Rodapé</Label>
                  <Switch
                    id="showFooter"
                    checked={printerConfig.showFooter}
                    onCheckedChange={(checked) =>
                      updateConfig({ showFooter: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showBarcode">Mostrar Código de Barras</Label>
                  <Switch
                    id="showBarcode"
                    checked={printerConfig.showBarcode}
                    onCheckedChange={(checked) =>
                      updateConfig({ showBarcode: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showQRCode">Mostrar QR Code</Label>
                  <Switch
                    id="showQRCode"
                    checked={printerConfig.showQRCode}
                    onCheckedChange={(checked) =>
                      updateConfig({ showQRCode: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Teste de Impressão */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Teste de Impressão
              </h3>

              <Button
                onClick={testPrint}
                variant="outline"
                className="w-full"
                disabled={!printerConfig.printerName}
              >
                Imprimir Página de Teste
              </Button>

              {testResult && (
                <div
                  className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                    testResult.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {testResult.type === "success" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações da Impressora Selecionada */}
        {printerConfig.printerName && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                Impressora Selecionada
              </span>
            </div>
            <div className="text-sm text-blue-700">
              <p>
                <strong>Nome:</strong> {printerConfig.printerName}
              </p>
              <p>
                <strong>Tipo:</strong>{" "}
                {
                  PRINTER_TYPES.find((t) => t.id === printerConfig.printerType)
                    ?.name
                }
              </p>
              <p>
                <strong>Marca:</strong> {printerConfig.printerBrand}
              </p>
              <p>
                <strong>Modelo:</strong> {printerConfig.printerModel}
              </p>
            </div>
          </div>
        )}

        <Separator />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PrinterConfigDialog;
