"use client";

import { useState } from "react";
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

  const handleConfirm = () => {
    onSelect(canChoose ? selectedType : defaultType);
    onOpenChange(false);
  };

  // REMOVER este setTimeout que está causando o problema
  // if (!canChoose) {
  //   setTimeout(() => {
  //     onSelect(defaultType)
  //     onOpenChange(false)
  //   }, 100)
  //   return null
  // }

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
                : "Ambos"}
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
                  : "Ambos"}
              </strong>
            </p>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm}>Confirmar</Button>
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
              onClick={() => setSelectedType("fiscal")}
              className="w-full h-16 flex flex-col items-center gap-2"
            >
              <Receipt className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold">Cupom Fiscal</div>
                <div className="text-xs opacity-75">
                  Documento oficial com validade fiscal
                </div>
              </div>
            </Button>

            <Button
              variant={selectedType === "receipt" ? "default" : "outline"}
              onClick={() => setSelectedType("receipt")}
              className="w-full h-16 flex flex-col items-center gap-2"
            >
              <FileText className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold">Recibo Simples</div>
                <div className="text-xs opacity-75">
                  Comprovante interno sem validade fiscal
                </div>
              </div>
            </Button>

            <Button
              variant={selectedType === "both" ? "default" : "outline"}
              onClick={() => setSelectedType("both")}
              className="w-full h-16 flex flex-col items-center gap-2"
            >
              <div className="flex gap-2">
                <Receipt className="w-5 h-5" />
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="font-semibold">Ambos</div>
                <div className="text-xs opacity-75">
                  Cupom fiscal + recibo simples
                </div>
              </div>
            </Button>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>Confirmar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
