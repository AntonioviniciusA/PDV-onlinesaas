import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { AuthService } from "./services/authServices";

const VerificarEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [codigo, setCodigo] = useState();

  useEffect(() => {
    if (location.state) {
      setEmail(location.state.email);
      setUserType(location.state.userType);

      // Não envia código automaticamente - só quando o usuário clicar em "Reenviar"
      setCanResend(true); // Permite reenvio imediatamente
      setCountdown(0);
    } else {
      // Se não tiver dados, redirecionar para login
      navigate("/");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    try {
      setCanResend(false);
      setCountdown(120); // 2 minutos

      // Chama a API para enviar o código
      const response = await AuthService.enviarCodigoEmail({
        destino: location.state.email,
        metodo: "email",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Código reenviado com sucesso");
      } else {
        console.error("❌ Erro ao reenviar código:", data.erro);
        // Se der erro 429 (muitas tentativas), mostra o tempo restante
        if (response.status === 429) {
          alert(data.erro);
          setCanResend(false);
          setCountdown(120); // Força 2 minutos de espera
        }
      }
    } catch (error) {
      console.error("❌ Erro ao reenviar e-mail:", error);
      alert("Erro ao reenviar e-mail. Tente novamente.");
      setCanResend(true);
    }
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  const handleCheckEmail = async () => {
    if (!codigo || codigo.length !== 6) {
      alert("Digite o código de 6 dígitos");
      return;
    }

    try {
      const response = await AuthService.VerificarCodigoEmail({
        destino: location.state.email,
        codigo: codigo,
      });

      const data = response.data; // axios retorna o JSON em .data
      console.log(data);
      if (data.sucesso === true) {
        console.log(data.mensagem);
        alert("E-mail verificado com sucesso! Você pode fazer login agora.");
        navigate("/");
      } else {
        alert(data.erro || "Código inválido ou expirado");
      }
    } catch (error) {
      console.error("❌ Erro ao verificar código:", error);
      alert("Erro ao verificar código. Tente novamente.");
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleBackToLogin}
            className="absolute top-4 left-4 text-gray-400 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifique seu e-mail
          </h1>

          <p className="text-gray-600">Enviamos um link de verificação para:</p>

          <p className="text-black font-semibold mt-2">{email}</p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Abra seu e-mail e digite o codigo de 6 digitos aqui
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Verifique também a pasta de spam/lixo eletrônico
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Após verificar, você poderá fazer login normalmente
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={codigo ?? ""}
            onChange={(e) => setCodigo?.(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Digite o código de 6 dígitos"
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <button
            onClick={handleCheckEmail}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Verificar E-mail
          </button>

          <button
            onClick={handleBackToLogin}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Voltar ao Login
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Não recebeu o e-mail?</p>

            {canResend ? (
              <button
                onClick={handleResendEmail}
                className="text-black font-semibold hover:underline"
              >
                Reenviar e-mail
              </button>
            ) : (
              <p className="text-sm text-gray-400">Reenviar em {countdown}s</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Problemas? Entre em contato conosco
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificarEmail;
