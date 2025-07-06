"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CreditCard, Utensils, Gift, Building } from "lucide-react"

interface CardPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectCardType: (type: string) => void
}

const cardTypes = [
  { id: "credito", name: "Crédito", icon: CreditCard, color: "text-blue-600" },
  { id: "debito", name: "Débito", icon: CreditCard, color: "text-green-600" },
  { id: "alimentacao", name: "Alimentação", icon: Utensils, color: "text-orange-600" },
  { id: "refeicao", name: "Refeição", icon: Utensils, color: "text-red-600" },
  { id: "vale-presente", name: "Vale Presente", icon: Gift, color: "text-purple-600" },
  { id: "corporativo", name: "Corporativo", icon: Building, color: "text-gray-600" },
]

export function CardPaymentDialog({ open, onOpenChange, onSelectCardType }: CardPaymentDialogProps) {
  const handleSelectType = (type: string) => {
    onSelectCardType(type)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Tipo de Cartão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Label>Selecione o tipo de cartão:</Label>

          <div className="grid grid-cols-2 gap-3">
            {cardTypes.map((type) => {
              const Icon = type.icon
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className="h-16 flex flex-col items-center gap-2 hover:bg-gray-50 bg-transparent"
                  onClick={() => handleSelectType(type.id)}
                >
                  <Icon className={`w-5 h-5 ${type.color}`} />
                  <span className="text-xs">{type.name}</span>
                </Button>
              )
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
  )
}
