import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Shield } from "lucide-react";
import { localAuthService } from "../services/localAuthService";

export default function AuthorizationRequest({
  open,
  onOpenChange,
  title = "Autorização Necessária",
  description = "",
  onAuthorize,
}) {
  const [entrada, setEntrada] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthorize = async () => {
    try {
      setIsLoading(true);
      const autorizacao = await localAuthService.autorizar(entrada);
      if (autorizacao.success) {
        setError("");
        onAuthorize(autorizacao.user, entrada);
        setEntrada("");
        setIsLoading(false);
      } else {
        setError(autorizacao.error);
        setIsLoading(false);
      }
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        {description && (
          <div className="mb-2 text-sm text-gray-600">{description}</div>
        )}
        <div className="space-y-3">
          <div>
            <Label>Senha/Cartão</Label>
            <input
              type="password"
              className="w-full border rounded p-2 mt-1"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              autoComplete="off"
              placeholder="Digite a senha ou passe o cartão"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button
            className="w-full"
            onClick={handleAuthorize}
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Autorizar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
