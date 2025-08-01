import React, { useState, useEffect } from "react";
import { Building2, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/authServices";
import { tokenService } from "../services/tokenService";

const AuthDialog = ({ isOpen, onClose, onAuthSuccess }) => {
  const [userType, setUserType] = useState("cliente"); // Valor padrão
  const [tokenData, setTokenData] = useState({
    token: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [tokenSuccess, setTokenSuccess] = useState("");
  const [tokenVerificado, setTokenVerificado] = useState(false);
  const navigate = useNavigate();

  // Verificar se há um token salvo ao carregar o componente
  useEffect(() => {
    if (tokenVerificado) return; // Evita verificação múltipla

    let isMounted = true;

    const verificarTokenSalvo = async () => {
      try {
        setTokenVerificado(true); // Marca como verificado
        const response = await tokenService.verificarTokenValido();
        if (isMounted && response.sucesso && response.valido) {
          // Token válido encontrado, preencher automaticamente
          setTokenData({ token: response.token });
          setTokenSuccess(
            "Token válido encontrado! Clique em 'Verificar Token' para continuar."
          );
        }
      } catch (error) {
        if (isMounted) {
          console.log("Nenhum token válido encontrado:", error.message);
        }
      }
    };

    verificarTokenSalvo();

    return () => {
      isMounted = false;
    };
  }, [tokenVerificado]);

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setTokenError("");
    setTokenSuccess("");
    setLoading(true);

    if (!tokenData.token || tokenData.token.trim() === "") {
      setTokenError("Token é obrigatório.");
      setLoading(false);
      return;
    }

    try {
      // Verificar se o token é válido
      const response = await AuthService.verifyToken(tokenData.token);

      if (response.success) {
        // Salvar o token nas configurações do sistema
        try {
          // Calcular expiração (assumindo 30 dias se não especificado)
          const expiracao = new Date();
          expiracao.setDate(expiracao.getDate() + 30);

          await tokenService.salvarToken(
            tokenData.token,
            expiracao.toISOString()
          );
          console.log("Token salvo com sucesso nas configurações");
        } catch (saveError) {
          console.error("Erro ao salvar token:", saveError);
          // Não bloquear o login se falhar ao salvar o token
        }

        setTokenSuccess("Token válido! Acesso concedido.");
        setShowDialog(false);
        navigate("/llogin");
        onAuthSuccess?.({ token: tokenData.token });
        onClose?.();
      } else {
        setTokenError(response.message || "Token inválido.");
      }
    } catch (error) {
      setTokenError("Erro ao verificar token. Tente novamente.");
      console.error("Erro na verificação do token:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!showDialog) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="bg-white px-4 w-full m-2 rounded-2xl shadow-lg relative animate-fadeIn flex flex-col">
        <div className="flex-1 p-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
          >
            ×
          </button>

          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-14 m-3 bg-black rounded-full mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Acesso ao Sistema
            </h1>
            <p className="text-gray-600">
              Digite seu token de acesso para continuar
            </p>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-2xl shadow p-6 max-w-md mx-auto">
            {tokenError && (
              <div className="mb-4 flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-3 animate-fadeIn">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span>{tokenError}</span>
              </div>
            )}

            {tokenSuccess && (
              <div className="mb-4 flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 rounded-lg px-4 py-3 animate-fadeIn">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{tokenSuccess}</span>
              </div>
            )}

            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="token"
                    placeholder="Digite seu token de acesso"
                    value={tokenData.token}
                    onChange={(e) =>
                      setTokenData({ ...tokenData, token: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Verificar Token"}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2025 Sua Empresa. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDialog;
