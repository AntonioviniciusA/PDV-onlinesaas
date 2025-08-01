import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { LogIn, AlertTriangle } from "lucide-react";
import { localAuthService } from "../services/localAuthService";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated } from "../hooks/useAuth";
import Loading from "../components/Loading";

export default function Login() {
  const [entrada, setEntrada] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: autenticado, isLoading: loadingAuth } = useIsAuthenticated();

  // Log para debug
  console.log("Login - Estado atual:", {
    autenticado,
    loadingAuth,
    isLoading,
    isRedirecting,
  });
  if (autenticado) {
    navigate("/pdv");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const login = await localAuthService.login({
        entrada: entrada,
      });

      if (login.success) {
        console.log("Login realizado com sucesso, invalidando queries...");
        setIsRedirecting(true);

        // Invalidar todas as queries relacionadas à autenticação
        await queryClient.invalidateQueries(["auth"]);
        await queryClient.invalidateQueries(["user"]);

        // Aguardar um pouco para garantir que as queries foram atualizadas
        setTimeout(() => {
          navigate("/pdv");
        }, 200);
      } else {
        setError("Usuário ou senha inválidos");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setError("Erro ao realizar login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!loadingAuth && autenticado === true && !isRedirecting) {
      console.log("Usuário já autenticado, redirecionando para /pdv");
      setIsRedirecting(true);
      // Usar setTimeout para evitar múltiplos redirecionamentos
      const timeoutId = setTimeout(() => {
        navigate("/pdv");
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [autenticado, loadingAuth, navigate, isRedirecting]);

  // Mostrar loading enquanto verifica autenticação
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  // Se já estiver autenticado, mostrar loading até redirecionar
  if (autenticado === true || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

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
