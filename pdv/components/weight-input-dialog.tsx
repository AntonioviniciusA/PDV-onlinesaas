"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scale, AlertTriangle } from "lucide-react"

interface WeightInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    name: string
    price: number
  } | null
  onConfirm: (weight: number) => void
}

export function WeightInputDialog({ open, onOpenChange, product, onConfirm }: WeightInputDialogProps) {
  const [weight, setWeight] = useState("")
  const [error, setError] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)

  // Focar no input quando o dialog abrir
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      setWeight("")
      setError("")
    }
  }, [open])

  const weightValue = Number.parseFloat(weight) || 0
  const totalPrice = product ? weightValue * product.price : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!weight.trim()) {
      setError("Digite o peso do produto")
      return
    }

    if (weightValue <= 0) {
      setError("O peso deve ser maior que zero")
      return
    }

    if (weightValue > 50) {
      setError("Peso muito alto. Verifique se está correto")
      return
    }

    onConfirm(weightValue)
    handleClose()
  }

  const handleClose = () => {
    setWeight("")
    setError("")
    onOpenChange(false)
  }

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Permitir apenas números e ponto decimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setWeight(value)
      setError("")
    }
  }

  // Botões de peso rápido
  const quickWeights = [0.1, 0.25, 0.5, 1.0, 1.5, 2.0]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            Informar Peso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Produto */}
          {product && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-center">
                <p className="font-semibold text-blue-900">{product.name}</p>
                <p className="text-sm text-blue-600">R$ {product.price.toFixed(2)} por kg</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="weight"
                  type="text"
                  value={weight}
                  onChange={handleWeightChange}
                  placeholder="0,000"
                  className="text-lg font-semibold text-center pr-12"
                  required
                  autoFocus
                />
                <span className="absolute right-3 top-3 text-gray-500 text-sm">kg</span>
              </div>
            </div>

            {/* Botões de peso rápido */}
            <div>
              <Label className="text-sm text-gray-600">Pesos Rápidos</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {quickWeights.map((quickWeight) => (
                  <Button
                    key={quickWeight}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setWeight(quickWeight.toString())}
                    className="text-xs"
                  >
                    {quickWeight} kg
                  </Button>
                ))}
              </div>
            </div>

            {/* Cálculo do Total */}
            {weightValue > 0 && product && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total a Pagar</p>
                  <p className="text-2xl font-bold text-green-600">R$ {totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {weightValue.toFixed(3)} kg × R$ {product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!weightValue || weightValue <= 0}>
                Adicionar ao Carrinho
              </Button>
            </div>
          </form>

          {/* Dica */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Dica:</strong> Use ponto (.) para decimais. Ex: 1.5 para 1,5kg
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
