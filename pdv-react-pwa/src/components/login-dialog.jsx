"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { LogIn, AlertTriangle } from "lucide-react";
import { MOCK_USERS } from "../types/user.js";

export function LoginDialog({ open, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simular autenticação
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = MOCK_USERS.find((u) => u.username === username && u.active);

    if (user && password === "123456") {
      // Senha padrão para demo
      onLogin(user);
      // Limpar campos após login bem-sucedido
      setUsername("");
      setPassword("");
    } else {
      setError("Usuário ou senha inválidos");
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} hideClose>
      <DialogContent className="max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Login no Sistema
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Usuários para teste:</strong>
          <div className="mt-2 space-y-1">
            <div>
              <strong>joao.caixa</strong> - Operador de Caixa
            </div>
            <div>
              <strong>maria.fiscal</strong> - Fiscal
            </div>
            <div>
              <strong>carlos.supervisor</strong> - Supervisor
            </div>
            <div>
              <strong>ana.gerente</strong> - Gerente
            </div>
            <div className="mt-2">
              <strong>Senha:</strong> 123456
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
