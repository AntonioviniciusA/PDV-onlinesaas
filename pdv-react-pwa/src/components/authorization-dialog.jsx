"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, AlertTriangle, CreditCard, CheckCircle } from "lucide-react";

// Códigos de autorização válidos (simulando cartões de cancelamento)
const VALID_AUTHORIZATION_CODES = {
  AUTH001FISCAL2024: {
    name: "João Silva",
    level: "fiscal",
    expires: "2024-12-31",
  },
  AUTH002SUPER2024: {
    name: "Maria Santos",
    level: "supervisor",
    expires: "2024-12-31",
  },
  AUTH003GERNT2024: {
    name: "Carlos Oliveira",
    level: "gerente",
    expires: "2024-12-31",
  },
  CANCEL123456789: {
    name: "Fiscal Geral",
    level: "fiscal",
    expires: "2024-12-31",
  },
  SUPER987654321: {
    name: "Supervisor Geral",
    level: "supervisor",
    expires: "2024-12-31",
  },
};

function decryptAuthCode(code) {
  // Simula descriptografia do código
  // Em um sistema real, isso seria uma descriptografia real
  const cleanCode = code.trim().toUpperCase();
  return VALID_AUTHORIZATION_CODES[cleanCode] || null;
}

export function AuthorizationDialog({
  open,
  onOpenChange,
  title,
  description,
  onAuthorize,
}) {
  const [authCode, setAuthCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [supervisor, setSupervisor] = useState(""); // eslint-disable-line no-unused-vars

  const inputRef = useRef(null);

  // Focar no input quando o dialog abrir
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authCode.trim()) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    // Simular validação do código
    await new Promise((resolve) => setTimeout(resolve, 500));

    const authData = decryptAuthCode(authCode);

    if (authData) {
      // Verificar se o código não expirou
      const today = new Date().toISOString().split("T")[0];
      if (authData.expires < today) {
        setError("Código de autorização expirado");
        setIsLoading(false);
        return;
      }

      setSupervisor(authData.name);
      setSuccess(`Autorização válida - ${authData.name} (${authData.level})`);

      // Aguardar um momento para mostrar o sucesso
      setTimeout(() => {
        onAuthorize(authData.name);
        handleClose();
      }, 1000);
    } else {
      setError("Código de autorização inválido");
    }

    setIsLoading(false);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;
    setAuthCode(value);
    setError("");
    setSuccess("");

    // Auto-submit quando o código tiver um tamanho específico (simula leitura do código de barras)
    if (value.length >= 13) {
      setTimeout(() => {
        handleSubmit(e);
      }, 100);
    }
  };

  const handleClose = () => {
    setAuthCode("");
    setError("");
    setSuccess("");
    setSupervisor("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Autorização Necessária
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{title}</strong>
              <br />
              {description}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="authCode" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Cartão de Autorização
              </Label>
              <Input
                ref={inputRef}
                id="authCode"
                type="text"
                value={authCode}
                onChange={handleCodeChange}
                placeholder="Escaneie o cartão de autorização..."
                required
                autoFocus
                className="font-mono"
                disabled={isLoading || !!success}
              />
              <p className="text-xs text-gray-500 mt-1">
                Passe o cartão de cancelamento no leitor ou digite o código
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !authCode.trim()}>
                {isLoading ? "Validando..." : "Autorizar"}
              </Button>
            </div>
          </form>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Códigos para teste:</strong>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <div>AUTH001FISCAL2024 - João Silva (Fiscal)</div>
              <div>AUTH002SUPER2024 - Maria Santos (Supervisor)</div>
              <div>CANCEL123456789 - Fiscal Geral</div>
              <div>SUPER987654321 - Supervisor Geral</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
