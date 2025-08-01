import React, { useState, useEffect } from "react";
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
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { caixaService } from "../services/caixaServices";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Limpar senha quando o componente for desmontado
  useEffect(() => {
    return () => {
      setEntrada("");
    };
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const senhaTemporaria = entrada; // Guarda a senha temporariamente

    try {
      const autorizado = await caixaService.autorizarCaixa(senhaTemporaria);
      // console.log("autorizado", autorizado);
      if (autorizado.sucesso) {
        setSuccess(true);
        onSuccess && onSuccess(autorizado.usuario);
        setEntrada(""); // Limpa a senha imediatamente após sucesso
        onOpenChange(false);
        onCloseRequestAuthorization && onCloseRequestAuthorization();
      } else {
        setSuccess(false);
        setError(autorizado.mensagem);
        setEntrada(""); // Limpa a senha em caso de erro
      }
    } catch (err) {
      setSuccess(false);
      setEntrada(""); // Limpa a senha em caso de erro

      if (!!err && err.status === 403) {
        setError(
          "Você não tem permissão para autorizar, entre em contato com o supervisor"
        );
      } else {
        setError("Erro de conexão com o servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      // Quando fechando o dialog
      setEntrada(""); // Limpa a senha ao fechar
      setError(""); // Limpa erros
      setSuccess(false); // Limpa sucesso
      onCloseRequestAuthorization && onCloseRequestAuthorization();
      navigate("/pdv");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            {title || "Autorização Necessária"}
          </DialogTitle>
          <DialogDescription>
            {description ||
              "Informe as credenciais de um usuário autorizador para continuar."}
          </DialogDescription>
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
