"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { CreditCard, Utensils, Gift, Building } from "lucide-react";
import { useEffect } from "react";

const cardTypes = [
  { id: "credito", name: "Crédito", icon: CreditCard, color: "text-blue-600" },
  { id: "debito", name: "Débito", icon: CreditCard, color: "text-green-600" },
  {
    id: "alimentacao",
    name: "Alimentação",
    icon: Utensils,
    color: "text-orange-600",
  },
  { id: "refeicao", name: "Refeição", icon: Utensils, color: "text-red-600" },
  {
    id: "vale-presente",
    name: "Vale Presente",
    icon: Gift,
    color: "text-purple-600",
  },
  {
    id: "corporativo",
    name: "Corporativo",
    icon: Building,
    color: "text-gray-600",
  },
];

export function CardPaymentDialog({ open, onOpenChange, onSelectCardType }) {
  const handleSelectType = (type) => {
    onSelectCardType(type);
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      // Aceita 1-9 do teclado principal e do numpad
      const idx = parseInt(e.key, 10);
      if (!isNaN(idx) && idx >= 1 && idx <= cardTypes.length) {
        handleSelectType(cardTypes[idx - 1].id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="card-payment-dialog-description"
      >
        <DialogDescription id="card-payment-dialog-description">
          Realize o pagamento com cartão.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Tipo de Cartão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Label>Selecione o tipo de cartão:</Label>

          <div className="grid grid-cols-2 gap-3">
            {cardTypes.map((type, idx) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className="h-16 flex flex-col items-center gap-2 hover:bg-gray-50 bg-transparent"
                  onClick={() => handleSelectType(type.id)}
                >
                  <Icon className={`w-5 h-5 ${type.color}`} />
                  <span className="text-xs">
                    {idx + 1} - {type.name}
                  </span>
                </Button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
