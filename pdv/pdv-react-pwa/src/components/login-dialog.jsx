import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { LogIn, AlertTriangle } from "lucide-react";
import { localAuthService } from "../services/localAuthService";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginPage() {
  const [entrada, setEntrada] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const login = await localAuthService.login({
      entrada: entrada,
    });

    if (login.success) {
      await queryClient.invalidateQueries(["auth"]);
      navigate("/pdv");
    } else {
      setError("Usuário ou senha inválidos");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <LogIn className="w-6 h-6" />
          <h1 className="text-xl font-bold">Login no Sistema</h1>
        </div>
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
      </div>
    </div>
  );
}
