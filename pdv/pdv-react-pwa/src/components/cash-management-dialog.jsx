"use client";

import { useEffect, useState } from "react";
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
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Printer,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { hasPermission } from "../utils/permissions";
import { caixaService } from "../services/caixaServices";
import { localAuthService } from "../services/localAuthService";
import RequestAuthorization from "./RequestAuthorization";

export function CashManagementDialog({
  open,
  onOpenChange,
  action,
  currentSession,
  onConfirm,
  user,
  userName,
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [showReport, setShowReport] = useState(false);

  const [permission, setPermission] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [caixa_numero, setCaixaNumero] = useState(1);

  useEffect(() => {
    if (!user) return;
    const permission = hasPermission(user, "cash", "manage");
    setPermission(permission);
  }, [user]);

  const handleAbrirCaixa = async (e) => {
    e.preventDefault();
    const valor = parseFloat(amount);
    const numeroCaixa = parseInt(caixa_numero, 10);

    if (permission === true) {
      try {
        const response = await caixaService.abrirCaixa(
          valor,
          user,
          numeroCaixa
        );

        onConfirm && onConfirm(response);
        onOpenChange(false);
      } catch (err) {
        alert("Erro ao abrir caixa: " + (err?.message || ""));
      }
    } else {
      setShowAuthDialog(true);
      setPendingAction(() => async (usuario) => {
        try {
          const response = await caixaService.abrirCaixa(
            valor,
            usuario,
            numeroCaixa
          );
          onConfirm && onConfirm(response);
          onOpenChange(false);
        } catch (err) {
          alert("Erro ao abrir caixa: " + (err?.message || ""));
        }
      });
    }
  };

  const handleFecharCaixa = async (e) => {
    e.preventDefault();
    const valor = parseFloat(amount);
    const numeroCaixa = parseInt(caixa_numero, 10);

    if (permission === true) {
      try {
        await caixaService.fecharCaixa(valor, user, numeroCaixa);

        onConfirm && onConfirm(valor);
        onOpenChange(false);
      } catch (err) {
        alert("Erro ao fechar caixa: " + (err?.message || ""));
      }
    } else {
      setShowAuthDialog(true);
      setPendingAction(() => async (usuario) => {
        try {
          await caixaService.fecharCaixa(valor, usuario, numeroCaixa);

          onConfirm && onConfirm(valor);
          onOpenChange(false);
        } catch (err) {
          alert(err?.message);
          console.log(err);
        }
      });
    }
  };

  const generateReport = () => {
    if (!currentSession) return;

    const difference =
      Number.parseFloat(amount) -
      (currentSession.initialAmount + currentSession.totalSales);

    const report = `
RELATÓRIO DE FECHAMENTO DE CAIXA
================================

Operador: ${currentSession.openedBy}
Abertura: ${new Date(currentSession.openedAt).toLocaleString("pt-BR")}
Fechamento: ${new Date().toLocaleString("pt-BR")}

VALORES:
--------
Valor Inicial: R$ ${currentSession.initialAmount.toFixed(2)}
Total em Vendas: R$ ${currentSession.totalSales.toFixed(2)}
Valor Esperado: R$ ${(
      currentSession.initialAmount + currentSession.totalSales
    ).toFixed(2)}
Valor Informado: R$ ${Number.parseFloat(amount).toFixed(2)}
Diferença: R$ ${difference.toFixed(2)} ${
      difference >= 0 ? "(Sobra)" : "(Falta)"
    }

TRANSAÇÕES:
-----------
Total de Vendas: ${currentSession.totalTransactions}
Ticket Médio: R$ ${
      currentSession.totalTransactions > 0
        ? (
            currentSession.totalSales / currentSession.totalTransactions
          ).toFixed(2)
        : "0.00"
    }

Fechado por: ${userName}
Data/Hora: ${new Date().toLocaleString("pt-BR")}
    `;

    alert(report);
    onOpenChange(false);
    setShowReport(false);
  };

  const expectedAmount = currentSession
    ? currentSession.initialAmount + currentSession.totalSales
    : 0;
  const difference = amount ? Number.parseFloat(amount) - expectedAmount : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="cash-management-dialog-description"
      >
        <DialogDescription id="cash-management-dialog-description">
          Gerencie o caixa do PDV.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {action === "open" ? "Abertura de Caixa" : "Fechamento de Caixa"}
          </DialogTitle>
        </DialogHeader>

        {!showReport ? (
          <form
            onSubmit={action === "open" ? handleAbrirCaixa : handleFecharCaixa}
            className="space-y-4"
          >
            {action === "open" ? (
              <div>
                <Alert className="border-blue-200 bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Informe o valor inicial em dinheiro no caixa para começar as
                    operações.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Label htmlFor="caixa_numero">Número do Caixa *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      Nº
                    </span>
                    <Input
                      id="caixa_numero"
                      type="number"
                      step="1"
                      min="1"
                      value={caixa_numero}
                      onChange={(e) => setCaixaNumero(e.target.value)}
                      placeholder="0,00"
                      className="pl-10 text-lg font-semibold"
                      required
                      autoFocus
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Número do caixa: {caixa_numero}
                  </p>
                </div>
                <div className="mt-4">
                  <Label htmlFor="initialAmount">Valor Inicial *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="initialAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="pl-10 text-lg font-semibold"
                      required
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor mínimo recomendado: R$ 50,00
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Conte todo o dinheiro no caixa e informe o valor total
                    encontrado.
                  </AlertDescription>
                </Alert>

                {currentSession && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Valor Inicial:</span>
                      <span className="font-semibold">
                        R$ {currentSession.initialAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total em Vendas:</span>
                      <span className="font-semibold text-green-600">
                        R$ {currentSession.totalSales.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Valor Esperado:</span>
                      <span className="text-blue-600">
                        R$ {expectedAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="finalAmount">
                    Valor Encontrado no Caixa *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      R$
                    </span>
                    <Input
                      id="finalAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="pl-10 text-lg font-semibold"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {amount && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Diferença:</span>
                      <div className="flex items-center gap-2">
                        {difference >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={`font-bold ${
                            difference >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          R$ {Math.abs(difference).toFixed(2)}
                          {difference >= 0 ? " (Sobra)" : " (Falta)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {action === "open" ? "Abrir Caixa" : "Fechar Caixa"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Caixa fechado com sucesso! Relatório gerado.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-end">
              <Button onClick={generateReport}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir Relatório
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
      <RequestAuthorization
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={(user, autorizador) => {
          setShowAuthDialog(false);
          if (pendingAction) {
            pendingAction(user, autorizador);
            setPendingAction(null);
          }
        }}
        title={
          action === "open"
            ? "Autorização para Abrir Caixa"
            : "Autorização para Fechar Caixa"
        }
        description="Informe as credenciais de um usuário autorizador."
      />
    </Dialog>
  );
}
