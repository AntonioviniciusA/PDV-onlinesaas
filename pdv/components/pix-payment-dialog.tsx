"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"

interface PixPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  onPaymentConfirmed: () => void
}

type PaymentStatus = "pending" | "paid" | "denied" | "expired"

export function PixPaymentDialog({ open, onOpenChange, amount, onPaymentConfirmed }: PixPaymentDialogProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos
  const [isSimulating, setIsSimulating] = useState(false)

  // Simular QR Code (em um sistema real seria gerado pela API do banco)
  const qrCodeData = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(7)}520400005303986540${amount.toFixed(2)}5802BR5925LOJA EXEMPLO6009SAO PAULO62070503***6304`

  // Timer para expiração do PIX
  useEffect(() => {
    if (!open || paymentStatus !== "pending") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus("expired")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, paymentStatus])

  // Reset quando abrir o dialog
  useEffect(() => {
    if (open) {
      setPaymentStatus("pending")
      setTimeLeft(300)
      setIsSimulating(false)
    }
  }, [open])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const simulatePayment = (status: "paid" | "denied") => {
    setIsSimulating(true)
    setTimeout(() => {
      setPaymentStatus(status)
      setIsSimulating(false)
      if (status === "paid") {
        setTimeout(() => {
          onPaymentConfirmed()
          onOpenChange(false)
        }, 2000)
      }
    }, 2000)
  }

  const generateNewQR = () => {
    setPaymentStatus("pending")
    setTimeLeft(300)
  }

  const getStatusColor = () => {
    switch (paymentStatus) {
      case "paid":
        return "text-green-600"
      case "denied":
        return "text-red-600"
      case "expired":
        return "text-gray-600"
      default:
        return "text-blue-600"
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "paid":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "denied":
        return <XCircle className="w-6 h-6 text-red-600" />
      case "expired":
        return <Clock className="w-6 h-6 text-gray-600" />
      default:
        return <QrCode className="w-6 h-6 text-blue-600" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Pagamento PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Valor */}
          <div className="text-center bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Valor a Pagar</p>
            <p className="text-2xl font-bold text-blue-600">R$ {amount.toFixed(2)}</p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center relative">
              {paymentStatus === "pending" ? (
                <div className="text-center">
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? "bg-black" : "bg-white"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">QR Code PIX</p>
                </div>
              ) : (
                <div className="text-center">
                  {getStatusIcon()}
                  <p className="text-sm mt-2 font-semibold">
                    {paymentStatus === "paid" && "PAGO"}
                    {paymentStatus === "denied" && "NEGADO"}
                    {paymentStatus === "expired" && "EXPIRADO"}
                  </p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className={`text-center ${getStatusColor()}`}>
              <p className="font-semibold">
                {paymentStatus === "pending" && `Aguardando pagamento... ${formatTime(timeLeft)}`}
                {paymentStatus === "paid" && "✅ TRANSAÇÃO AUTORIZADA"}
                {paymentStatus === "denied" && "❌ PAGAMENTO NEGADO"}
                {paymentStatus === "expired" && "⏰ QR CODE EXPIRADO"}
              </p>
            </div>
          </div>

          {/* Alertas */}
          {paymentStatus === "paid" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Pagamento confirmado! Finalizando venda...</AlertDescription>
            </Alert>
          )}

          {paymentStatus === "denied" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Pagamento negado. Tente novamente ou escolha outra forma de pagamento.
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === "expired" && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>QR Code expirado. Gere um novo código para continuar.</AlertDescription>
            </Alert>
          )}

          {/* Ações */}
          <div className="flex gap-2 justify-end">
            {paymentStatus === "pending" && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulatePayment("paid")}
                    disabled={isSimulating}
                    className="text-green-600 border-green-600"
                  >
                    {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Simular Pago"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulatePayment("denied")}
                    disabled={isSimulating}
                    className="text-red-600 border-red-600"
                  >
                    {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Simular Negado"}
                  </Button>
                </div>
              </>
            )}

            {(paymentStatus === "denied" || paymentStatus === "expired") && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={generateNewQR}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Novo QR Code
                </Button>
              </>
            )}
          </div>

          {/* Código PIX para debug */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded font-mono break-all">
            <strong>Código PIX:</strong> {qrCodeData.substring(0, 50)}...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
