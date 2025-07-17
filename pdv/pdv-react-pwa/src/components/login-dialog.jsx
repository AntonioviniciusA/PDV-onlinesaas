"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { LogIn, AlertTriangle } from "lucide-react";
import { localAuthService } from "../services/localAuthService";

export function LoginDialog({ open, onLogin }) {
  const [entrada, setEntrada] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const login = await localAuthService.login({
      entrada: entrada,
    });

    if (login.success) {
      console.log("login.user", login.user);
      console.log("login.token", login.token);
      localAuthService.setAuthData(login.token, login.user);
      onLogin(login.user);
      setIsLoading(false);
    } else {
      setError("Usuário ou senha inválidos");
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md"
        aria-describedby="login-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Login no Sistema
          </DialogTitle>
          <div id="login-dialog-description" className="sr-only">
            Digite sua senha para acessar o sistema PDV
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="entrada">Senha</Label>
            <Input
              id="entrada"
              type="password"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
