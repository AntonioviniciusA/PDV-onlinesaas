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
import { Receipt, FileText, Printer } from "lucide-react";

export function ReceiptSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  canChoose,
  defaultType,
}) {
  const [selectedType, setSelectedType] = useState(defaultType);

  // Atalhos de teclado: Alt+R (recibo), Alt+C (cupom)
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.altKey && (e.key === "r" || e.key === "R")) {
        setSelectedType("receipt");
        onSelect("receipt");
        onOpenChange(false);
        e.preventDefault();
      }
      if (e.altKey && (e.key === "c" || e.key === "C")) {
        setSelectedType("fiscal");
        onSelect("fiscal");
        onOpenChange(false);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, onSelect]);

  // Se não pode escolher, mostrar apenas uma confirmação
  if (!canChoose) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-md"
          aria-describedby="receipt-selection-dialog-description"
        >
          <DialogDescription id="receipt-selection-dialog-description">
            Será emitido:{" "}
            <strong>
              {defaultType === "fiscal"
                ? "Cupom Fiscal"
                : defaultType === "receipt"
                ? "Recibo Simples"
                : "Recibo Simples"}
            </strong>
          </DialogDescription>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Será emitido:{" "}
              <strong>
                {defaultType === "fiscal"
                  ? "Cupom Fiscal"
                  : defaultType === "receipt"
                  ? "Recibo Simples"
                  : "Recibo Simples"}
              </strong>
            </p>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="receipt-selection-dialog-description"
      >
        <DialogDescription id="receipt-selection-dialog-description">
          Selecione o tipo de recibo desejado.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Tipo de Comprovante
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Escolha o tipo de comprovante para esta venda:
          </p>

          <div className="space-y-3">
            <Button
              variant={selectedType === "fiscal" ? "default" : "outline"}
              onClick={() => {
                setSelectedType("fiscal");
                onSelect("fiscal");
                onOpenChange(false);
              }}
              className="w-full h-16 flex flex-col items-center gap-2"
            >
              <Receipt className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold">Cupom Fiscal (Alt+C)</div>
                <div className="text-xs opacity-75">
                  Documento oficial com validade fiscal
                </div>
              </div>
            </Button>

            <Button
              variant={selectedType === "receipt" ? "default" : "outline"}
              onClick={() => {
                setSelectedType("receipt");
                onSelect("receipt");
                onOpenChange(false);
              }}
              className="w-full h-16 flex flex-col items-center gap-2"
            >
              <FileText className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold">Recibo Simples (Alt+R)</div>
                <div className="text-xs opacity-75">
                  Comprovante interno sem validade fiscal
                </div>
              </div>
            </Button>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
