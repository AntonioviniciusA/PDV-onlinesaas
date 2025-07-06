"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Banknote, Calculator, AlertTriangle, CheckCircle } from "lucide-react"

interface CashPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalAmount: number
  onConfirm: (receivedAmount: number, changeAmount: number) => void
}

export function CashPaymentDialog({ open, onOpenChange, totalAmount, onConfirm }: CashPaymentDialogProps) {
  const [receivedAmount, setReceivedAmount] = useState("")
  const [error, setError] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)

  // Focar no input quando o dialog abrir
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      setReceivedAmount("")
      setError("")
    }
  }, [open])

  const received = Number.parseFloat(receivedAmount) || 0
  const change = received - totalAmount
  const isValidAmount = received >= totalAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!receivedAmount.trim()) {
      setError("Digite o valor recebido")
      return
    }

    if (received < totalAmount) {
      setError("Valor recebido é menor que o total da venda")
      return
    }

    onConfirm(received, change)
    handleClose()
  }

  const handleClose = () => {
    setReceivedAmount("")
    setError("")
    onOpenChange(false)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Permitir apenas números e ponto decimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setReceivedAmount(value)
      setError("")
    }
  }

  // Botões de valores rápidos
  const quickAmounts = [
    totalAmount, // Valor exato
    Math.ceil(totalAmount / 10) * 10, // Próximo múltiplo de 10
    Math.ceil(totalAmount / 20) * 20, // Próximo múltiplo de 20
    Math.ceil(totalAmount / 50) * 50, // Próximo múltiplo de 50
    Math.ceil(totalAmount / 100) * 100, // Próximo múltiplo de 100
  ].filter((value, index, array) => array.indexOf(value) === index) // Remove duplicatas

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-600" />
            Pagamento em Dinheiro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Valor Total */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total da Venda</p>
              <p className="text-3xl font-bold text-blue-600">R$ {totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="received">Valor Recebido</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">R$</span>
                <Input
                  ref={inputRef}
                  id="received"
                  type="text"
                  value={receivedAmount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="pl-10 text-lg font-semibold text-center"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Botões de valores rápidos */}
            <div>
              <Label className="text-sm text-gray-600">Valores Rápidos</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {quickAmounts.slice(0, 6).map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReceivedAmount(amount.toFixed(2))}
                    className="text-xs"
                  >
                    R$ {amount.toFixed(2)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cálculo do Troco */}
            {receivedAmount && (
              <div className="space-y-3">
                <Separator />
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Valor Recebido:</p>
                      <p className="font-semibold">R$ {received.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total da Venda:</p>
                      <p className="font-semibold">R$ {totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Troco a Retornar</p>
                    {isValidAmount ? (
                      <div className="flex items-center justify-center gap-2">
                        <Calculator className="w-5 h-5 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">R$ {change.toFixed(2)}</p>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-red-600">Valor insuficiente</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isValidAmount && change === 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">Valor exato - Sem troco</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isValidAmount} className="min-w-24">
                Confirmar
              </Button>
            </div>
          </form>

          {/* Dica para o caixa */}
          {isValidAmount && change > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <Banknote className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Atenção:</strong> Retornar R$ {change.toFixed(2)} de troco ao cliente
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
