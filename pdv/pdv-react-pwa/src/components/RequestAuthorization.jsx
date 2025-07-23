import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { caixaService } from "../services/caixaServices";
export default function RequestAuthorization({
  open,
  onOpenChange,
  onSuccess,
  title,
  description,
  onCloseRequestAuthorization,
}) {
  const [entrada, setEntrada] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const autorizado = await caixaService.autorizarCaixa(entrada);
      console.log("autorizado", autorizado);
      if (autorizado.sucesso) {
        setSuccess(true);
        onSuccess && onSuccess(autorizado.usuario);
        onOpenChange(false);
        onCloseRequestAuthorization && onCloseRequestAuthorization();
      } else {
        setSuccess(false);
        setError(autorizado.mensagem);
      }
    } catch (err) {
      setSuccess(false);
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            {title || "Autorização Necessária"}
          </DialogTitle>
          {description && (
            <div className="text-xs text-gray-500 mt-1">{description}</div>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="entrada">Entrada</Label>
              <Input
                id="entrada"
                type="password"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>Autorizado!</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verificando..." : "Autorizar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
