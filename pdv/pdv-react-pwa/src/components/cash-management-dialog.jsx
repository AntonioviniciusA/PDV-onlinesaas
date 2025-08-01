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
import { useCaixa } from "../hooks/useCaixa";

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

  // Usar o hook useCaixa para gerenciar o estado do caixa
  const { abrirCaixa, fecharCaixa, verificarCaixaAberto } = useCaixa();

  useEffect(() => {
    if (!user) return;
    const permission =
      hasPermission(user, "cash.manage") ||
      hasPermission(user, "pdv.cash") ||
      hasPermission(user, "*");
    setPermission(permission);
  }, [user]);

  const handleAbrirCaixa = async (e) => {
    e.preventDefault();
    const valor = parseFloat(amount);

    if (permission === true) {
      console.log("Abrindo caixa, permissao: ", permission);
      console.log("Abrindo caixa, user permissions: ", user.permissions);
      try {
        const response = await abrirCaixa(valor, user);
        onConfirm && onConfirm(response);
        onOpenChange(false);
        // Refazer a query para atualizar os dados
        verificarCaixaAberto();
      } catch (err) {
        alert("Erro ao abrir caixa: " + (err?.message || ""));
      }
    } else {
      setShowAuthDialog(true);
      setPendingAction(() => async (usuario) => {
        try {
          console.log("Abrindo caixa, permissao: ", permission);
          console.log("Usuario autorizado:", usuario);

          const response = await abrirCaixa(valor, usuario);

          onConfirm && onConfirm(response);
          onOpenChange(false);
          // Refazer a query para atualizar os dados
          verificarCaixaAberto();
        } catch (err) {
          console.error("Erro ao abrir caixa:", err);
          alert(
            "Erro ao abrir caixa: " +
              (err?.response?.data?.mensagem || err?.message || "")
          );
        }
      });
    }
  };

  const handleFecharCaixa = async (e) => {
    e.preventDefault();
    const valor = parseFloat(amount);

    if (permission === true) {
      try {
        await fecharCaixa(valor, user);
        onConfirm && onConfirm(valor);
        onOpenChange(false);
        // Refazer a query para atualizar os dados
        verificarCaixaAberto();
      } catch (err) {
        alert("Erro ao fechar caixa: " + (err?.message || ""));
      }
    } else {
      setShowAuthDialog(true);
      setPendingAction(() => async (usuario) => {
        try {
          console.log("Fechando caixa, usuario autorizado:", usuario);
          await fecharCaixa(valor, usuario);

          onConfirm && onConfirm(valor);
          onOpenChange(false);
          // Refazer a query para atualizar os dados
          verificarCaixaAberto();
        } catch (err) {
          console.error("Erro ao fechar caixa:", err);
          alert(
            "Erro ao fechar caixa: " +
              (err?.response?.data?.mensagem || err?.message || "")
          );
        }
      });
    }
  };

  const generateReport = () => {
    if (!currentSession) return;

    const initialAmount = Number(currentSession.initialAmount) || 0;
    const totalSales = Number(currentSession.totalSales) || 0;
    const finalAmount = Number(amount) || 0;
    const totalTransactions = Number(currentSession.totalTransactions) || 0;
    const difference = finalAmount - (initialAmount + totalSales);

    // Tratar a data de abertura
    let openedAtString = "Data não disponível";
    try {
      if (currentSession.openedAt) {
        openedAtString = new Date(currentSession.openedAt).toLocaleString(
          "pt-BR"
        );
      }
    } catch (error) {
      console.warn("Erro ao formatar data de abertura:", error);
    }

    const report = `
RELATÓRIO DE FECHAMENTO DE CAIXA
================================

Operador: ${currentSession.openedBy || "Não informado"}
Abertura: ${openedAtString}
Fechamento: ${new Date().toLocaleString("pt-BR")}

VALORES:
--------
Valor Inicial: R$ ${initialAmount.toFixed(2)}
Total em Vendas: R$ ${totalSales.toFixed(2)}
Valor Esperado: R$ ${(initialAmount + totalSales).toFixed(2)}
Valor Informado: R$ ${finalAmount.toFixed(2)}
Diferença: R$ ${difference.toFixed(2)} ${
      difference >= 0 ? "(Sobra)" : "(Falta)"
    }

TRANSAÇÕES:
-----------
Total de Vendas: ${totalTransactions}
Ticket Médio: R$ ${
      totalTransactions > 0
        ? (totalSales / totalTransactions).toFixed(2)
        : "0.00"
    }

Fechado por: ${userName || "Não informado"}
Data/Hora: ${new Date().toLocaleString("pt-BR")}
    `;

    alert(report);
    onOpenChange(false);
    setShowReport(false);
  };

  const initialAmount = currentSession
    ? Number(currentSession.initialAmount) || 0
    : 0;
  const totalSales = currentSession
    ? Number(currentSession.totalSales) || 0
    : 0;
  const expectedAmount = initialAmount + totalSales;
  const finalAmount = Number(amount) || 0;
  const difference = finalAmount - expectedAmount;

  // Verificar se currentSession existe antes de renderizar
  if (action === "close" && !currentSession) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-md"
          aria-describedby="cash-management-error-dialog-description"
        >
          <DialogDescription id="cash-management-error-dialog-description">
            Erro ao tentar fechar o caixa.
          </DialogDescription>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Erro
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">
              Nenhuma sessão de caixa encontrada para fechamento.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Verifique se o caixa está aberto antes de tentar fechá-lo.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
                        R$ {initialAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total em Vendas:</span>
                      <span className="font-semibold text-green-600">
                        R$ {totalSales.toFixed(2)}
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

                {amount && amount.trim() !== "" && (
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
        onSuccess={(usuario) => {
          setShowAuthDialog(false);
          if (pendingAction) {
            pendingAction(usuario);
            setPendingAction(null);
          }
        }}
        onCloseRequestAuthorization={() => {
          setShowAuthDialog(false);
          setPendingAction(null);
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
