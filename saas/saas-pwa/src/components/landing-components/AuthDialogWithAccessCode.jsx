import React, { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Key,
} from "lucide-react";
import { AuthService } from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AuthDialogWithAccessCode = ({ isOpen, onClose, onAuthSuccess }) => {
  const [userType, setUserType] = useState("cliente");
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);
  const [codigoAcesso, setCodigoAcesso] = useState("");
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "rememberMe") {
      setRememberMe(checked);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUserTypeSwitch = (type) => {
    setUserType(type);
    setFormData({ email: "", senha: "" });
    setLoginError("");
    setShowAccessCode(false);
    setCodigoAcesso("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");
    setLoading(true);

    // Validação de campos obrigatórios
    const requiredFields = ["email", "senha"];
    const emptyFields = requiredFields.filter(
      (field) => !formData[field] || formData[field].toString().trim() === ""
    );

    if (emptyFields.length > 0) {
      setInvalidFields(emptyFields);
      setLoginError("Todos os campos obrigatórios devem ser preenchidos.");
      setLoading(false);
      return;
    } else {
      setInvalidFields([]);
    }

    try {
      let response;
      if (userType === "cliente") {
        response = await AuthService.loginCliente({
          email: formData.email,
          senha: formData.senha,
        });

        if (response.token && response.codigo_acesso) {
          setUserData(response.user);
          setCodigoAcesso(response.codigo_acesso);
          setShowAccessCode(true);
          setLoginSuccess(
            "Login realizado com sucesso! Seu código de acesso foi gerado."
          );
        } else if (response.etapa === "verificacao_email") {
          setLoginError(
            "E-mail não verificado. Verifique seu e-mail antes de fazer login."
          );
        } else if (response.etapa === "dupla_autenticacao") {
          setLoginError(
            "Dupla autenticação ativada. Verifique seu e-mail para o código."
          );
        } else {
          setLoginError("Erro no login. Verifique seus dados.");
        }
      } else {
        response = await AuthService.loginParceiroSaas({
          email: formData.email,
          senha: formData.senha,
        });

        if (response && response.token && response.codigo_acesso) {
          setUserData(response.user);
          setCodigoAcesso(response.codigo_acesso);
          setShowAccessCode(true);
          setLoginSuccess(
            "Login realizado com sucesso! Seu código de acesso foi gerado."
          );
        } else {
          setLoginError("Erro no login do parceiro. Verifique seus dados.");
        }
      }
    } catch (error) {
      setLoginError(
        error.response?.data?.message ||
          `Erro ao fazer login do ${userType}. Verifique seus dados.`
      );
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codigoAcesso);
      setLoginSuccess("Código copiado para a área de transferência!");

      // Reset da mensagem após 3 segundos
      setTimeout(() => {
        setLoginSuccess(
          "Login realizado com sucesso! Seu código de acesso foi gerado."
        );
      }, 3000);
    } catch (err) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = codigoAcesso;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setLoginSuccess("Código copiado para a área de transferência!");

      setTimeout(() => {
        setLoginSuccess(
          "Login realizado com sucesso! Seu código de acesso foi gerado."
        );
      }, 3000);
    }
  };

  const handleClose = () => {
    setShowAccessCode(false);
    setCodigoAcesso("");
    setUserData(null);
    setFormData({ email: "", senha: "" });
    setLoginError("");
    setLoginSuccess("");
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl relative animate-fadeIn flex flex-col max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center mt-4 mb-2">
          <div className="flex rounded-full overflow-hidden border border-gray-200">
            <motion.button
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`px-5 py-2 text-sm font-semibold focus:outline-none transition-colors duration-200 ${
                userType === "cliente"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => handleUserTypeSwitch("cliente")}
            >
              Cliente
            </motion.button>
            <motion.button
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`px-5 py-2 text-sm font-semibold focus:outline-none transition-colors duration-200 ${
                userType === "parceiro"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => handleUserTypeSwitch("parceiro")}
            >
              Parceiro SaaS
            </motion.button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <button
            onClick={handleClose}
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
              {showAccessCode ? "Código de Acesso Gerado" : "Acesso com Código"}
            </h1>
            <p className="text-gray-600">
              {showAccessCode
                ? "Use este código para conectar ao servidor"
                : `Faça login para obter seu código de acesso ${
                    userType === "cliente" ? "empresarial" : "de parceiro"
                  }`}
            </p>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-2xl shadow p-6 w-full">
            {showAccessCode ? (
              // Tela do código de acesso
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{loginSuccess}</span>
                  </div>
                </div>

                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 justify-center mb-4">
                    <Key className="w-6 h-6 text-gray-600" />
                    <span className="text-lg font-semibold text-gray-700">
                      Código de Acesso
                    </span>
                  </div>

                  <div className="text-4xl font-mono font-bold text-black tracking-wider mb-4">
                    {codigoAcesso}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Este código expira em 30 minutos
                  </p>

                  <button
                    onClick={handleCopyCode}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Copiar Código
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  <p>Use este código para conectar ao servidor do sistema</p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Fechar
                </button>
              </motion.div>
            ) : (
              // Tela de login
              <form onSubmit={handleSubmit} className="space-y-6">
                {loginError && (
                  <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-3 animate-fadeIn">
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
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                        invalidFields.includes("email") ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="senha"
                      placeholder="Senha"
                      value={formData.senha}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                        invalidFields.includes("senha") ? "border-red-500" : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={rememberMe}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-sm text-gray-600"
                    >
                      Lembrar-me
                    </label>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? "Aguarde..." : "Entrar e Gerar Código"}
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© 2025 Sua Empresa. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDialogWithAccessCode;
