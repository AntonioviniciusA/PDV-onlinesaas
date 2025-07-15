"use client";

import { useState, useRef, useEffect } from "react";
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
import { Settings, Save, Eye, Palette, Layout } from "lucide-react";
import JsBarcode from "jsbarcode";

const DEFAULT_TEMPLATES = [
  {
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
  },
  {
    id: "compact",
    name: "Compacta",
    width: 100,
    height: 70,
    showComparison: false,
    showICMS: false,
    showBarcode: true,
    fontSize: { name: 10, price: 14, comparison: 8, barcode: 6 },
    colors: {
      background: "#ffffff",
      text: "#000000",
      price: "#16a34a",
      comparison: "#2563eb",
    },
  },
  {
    id: "premium",
    name: "Premium",
    width: 160,
    height: 120,
    showComparison: true,
    showICMS: true,
    showBarcode: true,
    fontSize: { name: 14, price: 22, comparison: 12, barcode: 10 },
    colors: {
      background: "#f8fafc",
      text: "#1e293b",
      price: "#059669",
      comparison: "#1d4ed8",
    },
  },
];

export function LabelConfigDialog({
  open,
  onOpenChange,
  currentTemplate,
  onSave,
}) {
  const [template, setTemplate] = useState(currentTemplate);
  const [selectedPreset, setSelectedPreset] = useState("");
  const barcodeRef = useRef();

  useEffect(() => {
    if (template.showCodebar && barcodeRef.current) {
      JsBarcode(barcodeRef.current, "7894900011517", {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
      });
    }
  }, [template.showCodebar]);

  const handleSave = () => {
    onSave(template);
    onOpenChange(false);
  };

  const loadPreset = (preset) => {
    setTemplate({ ...preset });
    setSelectedPreset(preset.id);
  };

  const updateTemplate = (updates) => {
    setTemplate((prev) => ({ ...prev, ...updates }));
    setSelectedPreset("");
  };

  const updateFontSize = (field, value) => {
    setTemplate((prev) => ({
      ...prev,
      fontSize: { ...prev.fontSize, [field]: value },
    }));
    setSelectedPreset("");
  };

  const updateColors = (field, value) => {
    setTemplate((prev) => ({
      ...prev,
      colors: { ...prev.colors, [field]: value },
    }));
    setSelectedPreset("");
  };

  // Função para imprimir o preview na Zebra
  function imprimirZebraPreview() {
    if (!window.BrowserPrint) {
      alert("Zebra Browser Print não está disponível. Verifique a instalação.");
      return;
    }
    window.BrowserPrint.getDefaultDevice("printer", function (device) {
      if (!device) {
        alert("Nenhuma impressora Zebra encontrada.");
        return;
      }
      // Dados do preview
      const nome = "Coca-Cola 350ml";
      const preco = "R$ 4,50";
      const codigo = "7894900011517";
      // Exemplo de comando ZPL (ajuste conforme seu layout)
      const zpl = `^XA^FO20,20^A0N,30,30^FD${nome}^FS^FO20,60^A0N,25,25^FD${preco}^FS^FO20,100^BY2^BCN,60,Y,N,N^FD${codigo}^FS^XZ`;
      device.send(zpl, undefined, function (err) {
        if (err) {
          alert("Erro ao imprimir: " + err);
        } else {
          alert("Etiqueta de preview enviada para a impressora!");
        }
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[98vh] overflow-y-auto"
        aria-describedby="label-config-dialog-description"
      >
        <DialogDescription id="label-config-dialog-description">
          Configure as etiquetas de preço conforme necessário.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração de Etiquetas
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações */}
          <div className="space-y-6">
            {/* Templates Predefinidos */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Templates Predefinidos
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {DEFAULT_TEMPLATES.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={
                      selectedPreset === preset.id ? "default" : "outline"
                    }
                    onClick={() => loadPreset(preset)}
                    className="justify-start"
                  >
                    {preset.name}
                    <Badge variant="secondary" className="ml-2">
                      {preset.width}×{preset.height}mm
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Dimensões */}
            <div>
              <h3 className="font-semibold mb-3">Dimensões (mm)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="width">Largura</Label>
                  <Input
                    id="width"
                    type="number"
                    min="50"
                    max="300"
                    value={template.width}
                    onChange={(e) =>
                      updateTemplate({ width: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="height">Altura</Label>
                  <Input
                    id="height"
                    type="number"
                    min="30"
                    max="200"
                    value={template.height}
                    onChange={(e) =>
                      updateTemplate({ height: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Elementos Visíveis */}
            <div>
              <h3 className="font-semibold mb-3">Elementos Visíveis</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showComparison"
                    checked={template.showComparison}
                    onChange={(e) =>
                      updateTemplate({ showComparison: e.target.checked })
                    }
                  />
                  <Label htmlFor="showComparison">
                    Mostrar comparação de preços
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showICMS"
                    checked={template.showICMS}
                    onChange={(e) =>
                      updateTemplate({ showICMS: e.target.checked })
                    }
                  />
                  <Label htmlFor="showICMS">Mostrar ICMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showCodebar"
                    checked={template.showCodebar}
                    onChange={(e) =>
                      updateTemplate({ showCodebar: e.target.checked })
                    }
                  />
                  <Label htmlFor="showICMS">Mostrar Barra de código</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showBarcode"
                    checked={template.showBarcode}
                    onChange={(e) =>
                      updateTemplate({ showBarcode: e.target.checked })
                    }
                  />
                  <Label htmlFor="showBarcode">Mostrar código de barras</Label>
                </div>
              </div>
            </div>

            {/* Tamanhos de Fonte */}
            <div>
              <h3 className="font-semibold mb-3">Tamanhos de Fonte (px)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fontName">Nome do Produto</Label>
                  <Input
                    id="fontName"
                    type="number"
                    min="8"
                    max="24"
                    value={template.fontSize.name}
                    onChange={(e) =>
                      updateFontSize("name", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fontPrice">Preço</Label>
                  <Input
                    id="fontPrice"
                    type="number"
                    min="12"
                    max="32"
                    value={template.fontSize.price}
                    onChange={(e) =>
                      updateFontSize("price", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fontComparison">Comparação</Label>
                  <Input
                    id="fontComparison"
                    type="number"
                    min="6"
                    max="16"
                    value={template.fontSize.comparison}
                    onChange={(e) =>
                      updateFontSize("comparison", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fontBarcode">Código de Barras</Label>
                  <Input
                    id="fontBarcode"
                    type="number"
                    min="6"
                    max="12"
                    value={template.fontSize.barcode}
                    onChange={(e) =>
                      updateFontSize("barcode", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Cores */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Cores
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="colorBg">Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorBg"
                      type="color"
                      value={template.colors.background}
                      onChange={(e) =>
                        updateColors("background", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.colors.background}
                      onChange={(e) =>
                        updateColors("background", e.target.value)
                      }
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="colorText">Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorText"
                      type="color"
                      value={template.colors.text}
                      onChange={(e) => updateColors("text", e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.colors.text}
                      onChange={(e) => updateColors("text", e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="colorPrice">Preço</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorPrice"
                      type="color"
                      value={template.colors.price}
                      onChange={(e) => updateColors("price", e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.colors.price}
                      onChange={(e) => updateColors("price", e.target.value)}
                      placeholder="#16a34a"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="colorComparison">Comparação</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorComparison"
                      type="color"
                      value={template.colors.comparison}
                      onChange={(e) =>
                        updateColors("comparison", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.colors.comparison}
                      onChange={(e) =>
                        updateColors("comparison", e.target.value)
                      }
                      placeholder="#2563eb"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview da Etiqueta
            </h3>

            <div className="flex justify-center">
              <div
                className="border-2 border-dashed border-gray-300 p-4 text-center"
                style={{
                  width: `${template.width * 2}px`,
                  height: `${template.height * 2.2}px`,
                  backgroundColor: template.colors.background,
                  color: template.colors.text,
                }}
              >
                <div
                  className="font-bold truncate mb-2"
                  style={{ fontSize: `${template.fontSize.name}px` }}
                >
                  Coca-Cola 350ml
                </div>
                <div
                  className="font-bold mb-1"
                  style={{
                    fontSize: `${template.fontSize.price}px`,
                    color: template.colors.price,
                  }}
                >
                  R$ 4,50
                </div>
                {template.showComparison && (
                  <div
                    className="font-semibold mb-1"
                    style={{
                      fontSize: `${template.fontSize.comparison}px`,
                      color: template.colors.comparison,
                    }}
                  >
                    R$ 12,86/l
                  </div>
                )}
                {template.showICMS && (
                  <div
                    className="text-gray-500 mb-1"
                    style={{ fontSize: `${template.fontSize.comparison}px` }}
                  >
                    ICMS 18%
                  </div>
                )}
                {template.showBarcode && (
                  <div
                    className="font-mono"
                    style={{ fontSize: `${template.fontSize.barcode}px` }}
                  >
                    7894900011517
                  </div>
                )}
                {template.showCodebar && (
                  <div className="flex justify-center mt-2">
                    <svg
                      ref={barcodeRef}
                      style={{
                        width: "100%",
                        height: "48px",
                        margin: "0 auto",
                        display: "block",
                      }}
                    ></svg>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              Tamanho real: {template.width}mm × {template.height}mm
            </div>

            <div className="bg-gray-50 p-3 rounded text-xs">
              <strong>Especificações:</strong>
              <ul className="mt-2 space-y-1">
                <li>
                  • Dimensões: {template.width} × {template.height} mm
                </li>
                <li>
                  • Elementos:{" "}
                  {[
                    template.showComparison && "Comparação",
                    template.showICMS && "ICMS",
                    template.showBarcode && "Código",
                    template.showCodebar && "Barra de código",
                  ]
                    .filter(Boolean)
                    .join(", ") || "Básicos"}
                </li>
                <li>• Fonte do preço: {template.fontSize.price}px</li>
              </ul>
            </div>

            <div className="flex justify-center mt-4">
              <Button
                onClick={imprimirZebraPreview}
                className="bg-black text-white hover:bg-gray-800"
              >
                Imprimir Preview na Zebra
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
