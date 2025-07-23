import React, { useState, useEffect } from "react";
import { Building2, Mail, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/authServices";

const AuthDialog = ({ isOpen, onClose, onAuthSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("cliente"); // "cliente" ou "parceiro"
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    cnpj: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);
  const [showDialog, setShowDialog] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "rememberMe") {
      setRememberMe(checked);
    } else if (name === "cnpj") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, cnpj: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUserTypeSwitch = (type) => {
    setUserType(type);
    setFormData({ email: "", senha: "", cnpj: "" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoginError("");
    setLoginSuccess("");
    setLoading(true);

    let requiredFields =
      userType === "cliente" ? ["email", "senha"] : ["email", "senha", "cnpj"];
    const emptyFields = requiredFields.filter(
      (field) => !formData[field] || formData[field].toString().trim() === ""
    );
    if (emptyFields.length > 0) {
      setInvalidFields(emptyFields);
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      setLoading(false);
      return;
    } else {
      setInvalidFields([]);
    }

    try {
      let payload = {
        email: formData.email,
        senha: formData.senha,
      };
      if (userType === "parceiro") {
        payload.cnpj = formData.cnpj;
      }
      const login = await AuthService.login(payload);
      console.log("login", login);
      if (login.success) {
        setShowDialog(false);
        navigate("/pdv");
        onAuthSuccess?.({ email: formData.email });
        onClose?.();
        setLoginSuccess("Login realizado com sucesso!");
      } else {
        setLoginError(
          login.message || "Erro ao fazer login. Verifique seus dados."
        );
      }
    } catch (error) {
      setLoginError(
        error.login?.message || `Erro ao fazer login. Verifique seus dados.`
      );
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!showDialog) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="bg-white px-4 w-full m-2 rounded-2xl shadow-lg relative animate-fadeIn flex flex-col">
        <div className="flex justify-center mt-4 mb-2">
          <div className="flex rounded-full overflow-hidden border border-gray-200">
            <button
              className={`px-5 py-2 text-sm font-semibold focus:outline-none transition-colors duration-200 ${
                userType === "cliente"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => handleUserTypeSwitch("cliente")}
            >
              Cliente
            </button>
            <button
              className={`px-5 py-2 text-sm font-semibold focus:outline-none transition-colors duration-200 ${
                userType === "parceiro"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => handleUserTypeSwitch("parceiro")}
            >
              Parceiro SaaS
            </button>
          </div>
        </div>
        <div className="flex-1 p-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
          >
            ×
          </button>
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-14 m-3 bg-black rounded-full mb-4`}
            >
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {userType === "cliente"
                ? "Acesso Empresarial"
                : "Acesso Parceiro SaaS"}
            </h1>
            <p className="text-gray-600">
              {userType === "cliente"
                ? "Faça login para acessar sua conta"
                : "Login para Parceiros SaaS"}
            </p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl shadow p-6 max-w-md mx-auto">
            {loginError && (
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
                <span>{loginError}</span>
              </div>
            )}
            {loginSuccess && (
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
                <span>{loginSuccess}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    type={showPassword ? "text" : "senha"}
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
                {userType === "parceiro" && (
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="cnpj"
                      placeholder="CNPJ do Cliente"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                        invalidFields.includes("cnpj") ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                )}
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Lembrar-me
                  </label>
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Aguarde..." : "Entrar"}
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
