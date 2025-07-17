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
import { etiquetaService } from "../services/etiquetaService";

export function LabelConfigDialog({
  open,
  onOpenChange,
  currentTemplate,
  onSave,
  templates,
}) {
  const [template, setTemplate] = useState({
    nome: currentTemplate?.nome ?? "Padrão",
    largura: currentTemplate?.largura ?? 140,
    altura: currentTemplate?.altura ?? 100,
    mostrar_comparacao: currentTemplate?.mostrar_comparacao ?? true,
    mostrar_icms: currentTemplate?.mostrar_icms ?? true,
    mostrar_codigo_de_barra: currentTemplate?.mostrar_codigo_de_barra ?? true,
    fonte_nome: currentTemplate?.fontSize?.name ?? 12,
    fonte_preco: currentTemplate?.fontSize?.price ?? 18,
    fonte_comparacao: currentTemplate?.fontSize?.comparison ?? 10,
    fonte_barcode: currentTemplate?.fontSize?.barcode ?? 8,
    cor_fundo: currentTemplate?.colors?.background ?? "#ffffff",
    cor_texto: currentTemplate?.colors?.text ?? "#000000",
    cor_preco: currentTemplate?.colors?.price ?? "#16a34a",
    cor_comparacao: currentTemplate?.colors?.comparison ?? "#2563eb",
  });
  const [defaultTemplates, setDefaultTemplates] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState("");
  const barcodeRef = useRef();

  useEffect(() => {
    if (template.mostrar_codigo_de_barra && barcodeRef.current) {
      JsBarcode(barcodeRef.current, "7894900011517", {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
      });
    }
  }, [template.mostrar_codigo_de_barra]);

  // Buscar templates de etiqueta do backend ao abrir o diálogo
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const defaultTemplates = await etiquetaService.listDefaultTemplates();
        console.log("defaultTemplates", defaultTemplates);
        setDefaultTemplates(defaultTemplates);
      } catch (err) {
        console.error("Erro ao buscar templates de etiqueta:", err);
      }
    }
    fetchTemplates();
  }, [open]);

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
                {defaultTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant={
                      selectedPreset === template.id ? "default" : "outline"
                    }
                    onClick={() => loadPreset(template)}
                    className="justify-start"
                  >
                    {template.nome}
                    <Badge variant="secondary" className="ml-2">
                      {template.largura}×{template.altura}mm
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
                    checked={template.mostrar_comparacao}
                    onChange={(e) =>
                      updateTemplate({ mostrar_comparacao: e.target.checked })
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
                    checked={template.mostrar_icms}
                    onChange={(e) =>
                      updateTemplate({ mostrar_icms: e.target.checked })
                    }
                  />
                  <Label htmlFor="showICMS">Mostrar ICMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showCodebar"
                    checked={template.mostrar_codigo_de_barra}
                    onChange={(e) =>
                      updateTemplate({
                        mostrar_codigo_de_barra: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="showICMS">Mostrar Barra de código</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showBarcode"
                    checked={template.mostrar_codigo_de_barra}
                    onChange={(e) =>
                      updateTemplate({
                        mostrar_codigo_de_barra: e.target.checked,
                      })
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
                    value={template.fonte_nome}
                    onChange={(e) =>
                      updateFontSize("fonte_nome", Number(e.target.value))
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
                    value={template.fonte_preco}
                    onChange={(e) =>
                      updateFontSize("fonte_preco", Number(e.target.value))
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
                    value={template.fonte_comparacao}
                    onChange={(e) =>
                      updateFontSize("fonte_comparacao", Number(e.target.value))
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
                    value={template.fonte_barcode}
                    onChange={(e) =>
                      updateFontSize("fonte_barcode", Number(e.target.value))
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
                      value={template.cor_fundo}
                      onChange={(e) =>
                        updateColors("cor_fundo", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.cor_fundo}
                      onChange={(e) =>
                        updateColors("cor_fundo", e.target.value)
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
                      value={template.cor_texto}
                      onChange={(e) =>
                        updateColors("cor_texto", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.cor_texto}
                      onChange={(e) =>
                        updateColors("cor_texto", e.target.value)
                      }
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
                      value={template.cor_preco}
                      onChange={(e) =>
                        updateColors("cor_preco", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.cor_preco}
                      onChange={(e) =>
                        updateColors("cor_preco", e.target.value)
                      }
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
                      value={template.cor_comparacao}
                      onChange={(e) =>
                        updateColors("cor_comparacao", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={template.cor_comparacao}
                      onChange={(e) =>
                        updateColors("cor_comparacao", e.target.value)
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
                  width: `${template.largura * 2}px`,
                  height: `${template.altura * 2.2}px`,
                  backgroundColor: template.cor_fundo,
                  color: template.cor_texto,
                }}
              >
                <div
                  className="font-bold truncate mb-2"
                  style={{ fontSize: `${template.fonte_nome}px` }}
                >
                  Coca-Cola 350ml
                </div>
                <div
                  className="font-bold mb-1"
                  style={{
                    fontSize: `${template.fonte_preco}px`,
                    color: template.cor_preco,
                  }}
                >
                  R$ 4,50
                </div>
                {template.mostrar_comparacao && (
                  <div
                    className="font-semibold mb-1"
                    style={{
                      fontSize: `${template.fonte_comparacao}px`,
                      color: template.cor_comparacao,
                    }}
                  >
                    R$ 12,86/l
                  </div>
                )}
                {template.mostrar_icms && (
                  <div
                    className="text-gray-500 mb-1"
                    style={{ fontSize: `${template.fonte_comparacao}px` }}
                  >
                    ICMS 18%
                  </div>
                )}
                {template.mostrar_codigo_de_barra && (
                  <div
                    className="font-mono"
                    style={{ fontSize: `${template.fonte_barcode}px` }}
                  >
                    7894900011517
                  </div>
                )}
                {template.mostrar_codigo_de_barra && (
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
              Tamanho real: {template.largura}mm × {template.altura}mm
            </div>

            <div className="bg-gray-50 p-3 rounded text-xs">
              <strong>Especificações:</strong>
              <ul className="mt-2 space-y-1">
                <li>
                  • Dimensões: {template.largura} × {template.altura} mm
                </li>
                <li>
                  • Elementos:{" "}
                  {[
                    template.mostrar_comparacao && "Comparação",
                    template.mostrar_icms && "ICMS",
                    template.mostrar_codigo_de_barra && "Código",
                    template.mostrar_codigo_de_barra && "Barra de código",
                  ]
                    .filter(Boolean)
                    .join(", ") || "Básicos"}
                </li>
                <li>• Fonte do preço: {template.fonte_preco}px</li>
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
