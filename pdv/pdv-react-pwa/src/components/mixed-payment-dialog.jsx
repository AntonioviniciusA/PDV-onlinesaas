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
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Calculator,
  Trash2,
  Plus,
  AlertTriangle,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Shield,
} from "lucide-react";

export function MixedPaymentDialog({
  open,
  onOpenChange,
  totalAmount,
  onConfirm,
  onRequestAuthorization,
}) {
  const [payments, setPayments] = useState([]);
  const [newPaymentType, setNewPaymentType] = useState("");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");

  const [pixPaymentStatus, setPixPaymentStatus] = useState("pending");
  const [pixTimeLeft, setPixTimeLeft] = useState(300);
  const [isSimulatingPix, setIsSimulatingPix] = useState(false);
  const [pixAuthorizedByFiscal, setPixAuthorizedByFiscal] = useState(false);

  // Timer para expiração do PIX
  useEffect(() => {
    const pixPayment = payments.find((p) => p.type === "pix");
    if (!pixPayment || pixPaymentStatus !== "pending") return;

    const timer = setInterval(() => {
      setPixTimeLeft((prev) => {
        if (prev <= 1) {
          setPixPaymentStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [payments, pixPaymentStatus]);

  // Reset PIX quando dialog abrir
  useEffect(() => {
    if (open) {
      setPixPaymentStatus("pending");
      setPixTimeLeft(300);
      setIsSimulatingPix(false);
      setPixAuthorizedByFiscal(false);
    }
  }, [open]);

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = totalAmount - totalPaid;
  const pixPayment = payments.find((p) => p.type === "pix");
  const hasPixPayment = !!pixPayment;
  const pixAmount = pixPayment?.amount || 0;
  const isPixValid =
    !hasPixPayment || pixPaymentStatus === "paid" || pixAuthorizedByFiscal;
  const isComplete = Math.abs(remaining) < 0.01 && isPixValid;

  const paymentOptions = [
    { id: "dinheiro", name: "Dinheiro" },
    { id: "credito", name: "Cartão Crédito" },
    { id: "debito", name: "Cartão Débito" },
    { id: "pix", name: "PIX" },
    { id: "alimentacao", name: "Vale Alimentação" },
    { id: "refeicao", name: "Vale Refeição" },
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const simulatePixPayment = (status) => {
    setIsSimulatingPix(true);
    setTimeout(() => {
      setPixPaymentStatus(status);
      setIsSimulatingPix(false);
    }, 2000);
  };

  const generateNewPixQR = () => {
    setPixPaymentStatus("pending");
    setPixTimeLeft(300);
  };

  const requestPixAuthorization = () => {
    if (onRequestAuthorization) {
      onRequestAuthorization({
        type: "pix-override",
        title: "Alterar Status PIX",
        description:
          "Autorizar finalização da venda sem confirmação do PIX. Esta ação requer autorização do fiscal.",
        action: () => setPixAuthorizedByFiscal(true),
      });
    }
  };

  const addPayment = () => {
    if (!newPaymentType || !newPaymentAmount) return;

    const amount = Number.parseFloat(newPaymentAmount);
    if (amount <= 0) return;

    const paymentName =
      paymentOptions.find((p) => p.id === newPaymentType)?.name ||
      newPaymentType;

    const newPayment = {
      id: Date.now().toString(),
      type: newPaymentType,
      name: paymentName,
      amount: amount,
    };

    setPayments((prev) => [...prev, newPayment]);
    setNewPaymentType("");
    setNewPaymentAmount("");
  };

  const removePayment = (id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConfirm = () => {
    if (isComplete) {
      onConfirm(payments);
      setPayments([]);
      onOpenChange(false);
    }
  };

  const fillRemaining = () => {
    if (remaining > 0) {
      setNewPaymentAmount(remaining.toFixed(2));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        aria-describedby="mixed-payment-dialog-description"
      >
        <DialogDescription id="mixed-payment-dialog-description">
          Realize o pagamento utilizando múltiplas formas.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Pagamento Misto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="font-bold text-blue-600">
                  R$ {totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pago</p>
                <p className="font-bold text-green-600">
                  R$ {totalPaid.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Restante</p>
                <p
                  className={`font-bold ${
                    remaining > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  R$ {Math.abs(remaining).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Pagamentos Adicionados */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <Label>Formas de Pagamento:</Label>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{payment.name}</Badge>
                    <span className="font-semibold">
                      R$ {payment.amount.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removePayment(payment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* QR Code PIX */}
          {hasPixPayment && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <Label>PIX - R$ {pixAmount.toFixed(2)}</Label>
              </div>

              <div className="flex flex-col items-center space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center relative">
                  {pixPaymentStatus === "pending" ? (
                    <div className="text-center">
                      <div className="grid grid-cols-6 gap-1 mb-1">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 ${
                              Math.random() > 0.5 ? "bg-black" : "bg-white"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">QR PIX</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      {pixPaymentStatus === "paid" && (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      )}
                      {pixPaymentStatus === "denied" && (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                      {pixPaymentStatus === "expired" && (
                        <Clock className="w-8 h-8 text-gray-600" />
                      )}
                      <p className="text-xs mt-1 font-semibold">
                        {pixPaymentStatus === "paid" && "PAGO"}
                        {pixPaymentStatus === "denied" && "NEGADO"}
                        {pixPaymentStatus === "expired" && "EXPIRADO"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status PIX */}
                <div className="text-center">
                  {pixPaymentStatus === "pending" && (
                    <p className="text-sm text-blue-600 font-semibold">
                      Aguardando PIX... {formatTime(pixTimeLeft)}
                    </p>
                  )}
                  {pixPaymentStatus === "paid" && (
                    <p className="text-sm text-green-600 font-semibold">
                      ✅ PIX CONFIRMADO
                    </p>
                  )}
                  {pixPaymentStatus === "denied" && (
                    <p className="text-sm text-red-600 font-semibold">
                      ❌ PIX NEGADO
                    </p>
                  )}
                  {pixPaymentStatus === "expired" && (
                    <p className="text-sm text-gray-600 font-semibold">
                      ⏰ PIX EXPIRADO
                    </p>
                  )}
                  {pixAuthorizedByFiscal && (
                    <p className="text-sm text-orange-600 font-semibold">
                      🛡️ AUTORIZADO PELO FISCAL
                    </p>
                  )}
                </div>

                {/* Botões PIX */}
                {pixPaymentStatus === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => simulatePixPayment("paid")}
                      disabled={isSimulatingPix}
                      className="text-green-600 border-green-600"
                    >
                      {isSimulatingPix ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        "Simular Pago"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => simulatePixPayment("denied")}
                      disabled={isSimulatingPix}
                      className="text-red-600 border-red-600"
                    >
                      {isSimulatingPix ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        "Simular Negado"
                      )}
                    </Button>
                  </div>
                )}

                {(pixPaymentStatus === "denied" ||
                  pixPaymentStatus === "expired") && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={generateNewPixQR}
                      variant="outline"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Novo QR
                    </Button>
                    <Button
                      size="sm"
                      onClick={requestPixAuthorization}
                      variant="outline"
                      className="text-orange-600 bg-transparent"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Autorizar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adicionar Pagamento */}
          {!isComplete && (
            <div className="space-y-3 border-t pt-4">
              <Label>Adicionar Forma de Pagamento:</Label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="paymentType">Tipo</Label>
                  <select
                    id="paymentType"
                    value={newPaymentType}
                    onChange={(e) => setNewPaymentType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Selecione...</option>
                    {paymentOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="paymentAmount">Valor</Label>
                  <div className="flex gap-1">
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPaymentAmount}
                      onChange={(e) => setNewPaymentAmount(e.target.value)}
                      placeholder="0,00"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={fillRemaining}
                      title="Preencher valor restante"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={addPayment}
                disabled={!newPaymentType || !newPaymentAmount}
                className="w-full"
              >
                Adicionar Pagamento
              </Button>
            </div>
          )}

          {/* Alertas */}
          {remaining > 0.01 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Ainda faltam R$ {remaining.toFixed(2)} para completar o
                pagamento.
              </AlertDescription>
            </Alert>
          )}

          {hasPixPayment &&
            pixPaymentStatus === "pending" &&
            Math.abs(remaining) < 0.01 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Aguardando confirmação do PIX para finalizar a venda.
                </AlertDescription>
              </Alert>
            )}

          {hasPixPayment && pixPaymentStatus === "denied" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                PIX negado. Gere um novo QR Code ou solicite autorização do
                fiscal.
              </AlertDescription>
            </Alert>
          )}

          {hasPixPayment && pixPaymentStatus === "expired" && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                QR Code PIX expirado. Gere um novo código ou solicite
                autorização do fiscal.
              </AlertDescription>
            </Alert>
          )}

          {pixAuthorizedByFiscal && (
            <Alert className="border-orange-200 bg-orange-50">
              <Shield className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                PIX autorizado pelo fiscal para finalização da venda.
              </AlertDescription>
            </Alert>
          )}

          {isComplete && !hasPixPayment && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✅ Pagamento completo! Pode finalizar a venda.
              </AlertDescription>
            </Alert>
          )}

          {isComplete &&
            hasPixPayment &&
            (pixPaymentStatus === "paid" || pixAuthorizedByFiscal) && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  ✅ Pagamento completo e PIX confirmado! Pode finalizar a
                  venda.
                </AlertDescription>
              </Alert>
            )}

          {/* Ações */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!isComplete}>
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
