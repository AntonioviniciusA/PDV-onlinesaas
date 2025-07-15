import React, { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { AuthService } from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
const AuthDialog = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState("cliente"); // "cliente" ou "parceiro"
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    confirmPassword: "",
    companyName: "",
    cnpj: "",
    contactName: "",
    phone: "",
    address: "",
    nome: "",
    cpf: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [invalidFields, setInvalidFields] = useState([]);
  const [etapa, setEtapa] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [idCliente, setIdCliente] = useState(null);
  const [emailVerificacao, setEmailVerificacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  // Adicionar estados separados para erros
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  // Funções de máscara
  const formatCPF = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
      6,
      9
    )}-${digits.slice(9, 11)}`;
  };
  const formatCNPJ = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8)
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12)
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
        5,
        8
      )}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
      5,
      8
    )}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };
  const formatCEP = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  // Função para formatar telefone visualmente
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
        7,
        11
      )}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
      7,
      11
    )}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "rememberMe") {
      setRememberMe(checked);
    } else if (name === "phone" || name === "telefone") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: digits,
        phoneFormatted: formatPhone(digits),
      }));
    } else if (name === "cpf") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        cpf: digits,
        cpfFormatted: formatCPF(digits),
      }));
    } else if (name === "cnpj") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        cnpj: digits,
        cnpjFormatted: formatCNPJ(digits),
      }));
    } else if (name === "cep") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        cep: digits,
        cepFormatted: formatCEP(digits),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUserTypeSwitch = (type) => {
    setUserType(type);
    setFormData(type === "cliente" ? initialCliente : initialParceiro);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoginError("");
    setRegisterError("");
    setLoginSuccess("");
    setRegisterSuccess("");
    setLoading(true);

    // Validação de campos obrigatórios
    let requiredFields = [];
    if (isLogin) {
      requiredFields =
        userType === "cliente" ? ["email", "senha"] : ["email", "senha"];
    } else {
      requiredFields =
        userType === "cliente"
          ? [
              "razao_social",
              "cnpj",
              "nome_representante",
              "cpf",
              "email",
              "senha",
              "confirmPassword",
              "telefone",
              "endereco",
              "cidade",
              "estado",
              "cep",
            ]
          : ["nome", "cpf", "email", "senha", "confirmPassword", "phone"];
    }
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
      if (isLogin) {
        let response;
        if (userType === "cliente") {
          response = await AuthService.loginCliente({
            email: formData.email,
            senha: formData.senha,
          });
          console.log(response.token);
          if (response.token) {
            sessionStorage.setItem("token", response.token);
            sessionStorage.setItem("user", JSON.stringify(response.user));
            if (rememberMe) {
              localStorage.setItem("token", response.token);
              localStorage.setItem("user", JSON.stringify(response.user));
            }
            navigate("/");
            onAuthSuccess?.({ email: formData.email });
            onClose?.();
            setLoginSuccess("Login realizado com sucesso!");
          } else if (response.etapa === "verificacao_email") {
            setEtapa("verificacao_email");
            setIdCliente(response.id_cliente);
            setEmailVerificacao(response.email);
            setMensagem(
              "Enviamos um código para seu e-mail. Digite para confirmar."
            );
          } else if (response.etapa === "dupla_autenticacao") {
            setEtapa("dupla_autenticacao");
            setIdCliente(response.id_cliente);
            setEmailVerificacao(response.email);
            setMensagem(
              "Enviamos um código de autenticação para seu e-mail. Digite para continuar."
            );
          }
        } else {
          response = await AuthService.loginParceiroSaas({
            email: formData.email,
            senha: formData.senha,
          });
          if (response && response.token) {
            sessionStorage.setItem("token", response.token);
            sessionStorage.setItem("user", JSON.stringify(response.user));
            if (rememberMe) {
              localStorage.setItem("token", response.token);
              localStorage.setItem("user", JSON.stringify(response.user));
            }
            navigate("/");
            onAuthSuccess?.({ email: formData.email });
            onClose?.();
            setLoginSuccess("Login realizado com sucesso!");
          }
        }
      } else {
        // Cadastro
        if (userType === "cliente") {
          await AuthService.registerCliente({
            razao_social: formData.razao_social,
            cnpj: formData.cnpj,
            nome_representante: formData.nome_representante,
            cpf: formData.cpf,
            email: formData.email,
            senha: formData.senha,
            telefone: formData.telefone,
            endereco: formData.endereco,
            cidade: formData.cidade,
            estado: formData.estado,
            cep: formData.cep,
          });
          await AuthService.enviarCodigoEmail({
            destino: formData.email,
            metodo: "email",
          });
          setRegisterSuccess("Cadastro de cliente realizado com sucesso!");
        } else {
          const responseRPS = await AuthService.registerParceiroSaas({
            email: formData.email,
            senha: formData.senha,
            confirmPassword: formData.confirmPassword,
            nome: formData.nome,
            cpf: formData.cpf,
            phone: formData.phone,
          });
          if (responseRPS.status === 201) {
            setRegisterSuccess("Cadastro de parceiro realizado com sucesso!");
            setIsLogin(true);
          }
        }
        setTimeout(() => {
          setLoading(false);
          // Redirecionar para página de verificação de email
          navigate("/verificar-email", {
            state: {
              email: formData.email,
              userType: userType,
            },
          });
          onClose?.();
        }, 1000);
      }
    } catch (error) {
      if (isLogin) {
        if (userType === "cliente") {
          setLoginError(
            error.response?.data?.message ||
              "Erro ao fazer login do cliente. Verifique seus dados."
          );
        } else {
          setLoginError(
            error.response?.data?.message ||
              "Erro ao fazer login do parceiro. Verifique seus dados."
          );
        }
      } else {
        if (userType === "cliente") {
          // Tratamento específico para erro 409 (conflito)
          if (error.response?.status === 409) {
            setRegisterError(
              "E-mail, CPF ou CNPJ já cadastrado. Verifique os dados ou faça login."
            );
          } else {
            setRegisterError(
              error.response?.data?.message ||
                "Erro ao cadastrar cliente. Verifique os dados."
            );
          }
        } else {
          setRegisterError(
            error.response?.data?.message ||
              "Erro ao cadastrar parceiro. Verifique os dados."
          );
        }
      }
      console.error("Erro no login/cadastro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let url =
        etapa === "verificacao_email"
          ? "/cliente/verificar-email"
          : "/cliente/verificar-codigo";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cliente: idCliente, codigo }),
      });
      const data = await res.json();
      if (data.sucesso) {
        setEtapa(null);
        setCodigo("");
        setMensagem("");
        // Após verificação, tentar login novamente
        const loginResp = await AuthService.loginCliente({
          email: formData.email,
          senha: formData.senha,
        });
        if (loginResp.token) {
          sessionStorage.setItem("token", loginResp.token);
          sessionStorage.setItem("user", JSON.stringify(loginResp.user));
          if (rememberMe) {
            localStorage.setItem("token", loginResp.token);
            localStorage.setItem("user", JSON.stringify(loginResp.user));
          }
          navigate("/");
          onAuthSuccess?.({ email: formData.email });
          onClose?.();
        }
      } else {
        setError(data.erro || "Código inválido ou expirado");
      }
    } catch (err) {
      setError("Erro ao verificar código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      senha: "",
      confirmPassword: "",
      companyName: "",
      cnpj: "",
      contactName: "",
      phone: "",
      address: "",
    });
    setError("");
  };

  // Campos iniciais para cada tipo
  const initialCliente = {
    email: "",
    senha: "",
    confirmPassword: "",
    razao_social: "",
    cnpj: "",
    cnpjFormatted: "",
    nome_representante: "",
    cpf: "",
    cpfFormatted: "",
    telefone: "",
    phoneFormatted: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    cepFormatted: "",
  };
  const initialParceiro = {
    email: "",
    senha: "",
    confirmPassword: "",
    nome: "",
    cpf: "",
    cpfFormatted: "",
    phone: "",
    phoneFormatted: "",
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="bg-white px-4 w-full m-2 rounded-2xl shadow-lg relative animate-fadeIn flex flex-col">
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
              {isLogin
                ? userType === "cliente"
                  ? "Acesso Empresarial"
                  : "Acesso Parceiro SaaS"
                : userType === "cliente"
                ? "Cadastro Empresarial"
                : "Cadastro Parceiro SaaS"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? userType === "cliente"
                  ? "Faça login para acessar sua conta"
                  : "Login para Parceiros SaaS"
                : userType === "cliente"
                ? "Crie sua conta empresarial agora"
                : "Crie sua conta de parceiro agora"}
            </p>
          </div>
          <div
            className={`bg-white border-2 border-gray-100 rounded-2xl shadow p-6 ${
              isLogin ? "max-w-md mx-auto" : "w-full"
            }`}
          >
            {etapa && (
              <form onSubmit={handleVerificarCodigo} className="space-y-4">
                <div className="text-center text-sm text-gray-700 mb-2">
                  {mensagem}
                </div>
                <input
                  type="text"
                  name="codigo"
                  placeholder="Digite o código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                  maxLength={6}
                />
                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Verificando..." : "Verificar"}
                </button>
              </form>
            )}
            {loginError && isLogin && (
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
            {registerError && !isLogin && (
              <div className="mb-4 flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg px-4 py-3 animate-fadeIn">
                <svg
                  className="w-5 h-5 text-yellow-500"
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
                <span>{registerError}</span>
              </div>
            )}
            {loginSuccess && isLogin && (
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
            {registerSuccess && !isLogin && (
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
                <span>{registerSuccess}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key={userType + "-login"}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                  >
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
                            invalidFields.includes("email")
                              ? "border-red-500"
                              : ""
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
                            invalidFields.includes("senha")
                              ? "border-red-500"
                              : ""
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
                      {userType === "cliente" && <></>}
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
                  </motion.div>
                ) : (
                  <motion.div
                    key={userType + "-register"}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 font-semibold text-gray-700 mt-2 mb-1">
                        Dados da Empresa
                      </div>
                      <div>
                        {/* Razão Social */}
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="razao_social"
                            placeholder="Razão Social da Empresa"
                            value={formData.razao_social}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                              invalidFields.includes("razao_social")
                                ? "border-red-500"
                                : ""
                            }`}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        {/* CNPJ */}
                        <div className="relative">
                          <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="cnpj"
                            placeholder="CNPJ"
                            value={formData.cnpjFormatted || ""}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                              invalidFields.includes("cnpj")
                                ? "border-red-500"
                                : ""
                            }`}
                            required
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 font-semibold text-gray-700 mt-2 mb-1">
                        Dados do Representante
                      </div>
                      <div>
                        {/* Nome do Representante */}
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="nome_representante"
                            placeholder="Nome do Representante"
                            value={formData.nome_representante}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                              invalidFields.includes("nome_representante")
                                ? "border-red-500"
                                : ""
                            }`}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        {/* CPF do Representante */}
                        <div className="relative">
                          <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="cpf"
                            placeholder="CPF do Representante"
                            value={formData.cpfFormatted || ""}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                              invalidFields.includes("cpf")
                                ? "border-red-500"
                                : ""
                            }`}
                            required
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 font-semibold text-gray-700 mt-2 mb-1">
                        Contato e Endereço
                      </div>
                      <div>
                        {/* Email */}
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            placeholder="Email empresarial"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                              invalidFields.includes("email")
                                ? "border-red-500"
                                : ""
                            }`}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        {/* Telefone */}
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            name="telefone"
                            placeholder="Telefone"
                            value={formData.phoneFormatted || ""}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                              invalidFields.includes("telefone")
                                ? "border-red-500"
                                : ""
                            }`}
                            required
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        {/* Endereço */}
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="endereco"
                            placeholder="Endereço da Empresa"
                            value={formData.endereco}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                              invalidFields.includes("endereco")
                                ? "border-red-500"
                                : ""
                            }`}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        {/* Cidade */}
                        <input
                          type="text"
                          name="cidade"
                          placeholder="Cidade"
                          value={formData.cidade}
                          onChange={handleInputChange}
                          className={`w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                            invalidFields.includes("cidade")
                              ? "border-red-500"
                              : ""
                          }`}
                          required
                        />
                      </div>
                      <div>
                        {/* Estado */}
                        <input
                          type="text"
                          name="estado"
                          placeholder="Estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          className={`w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                            invalidFields.includes("estado")
                              ? "border-red-500"
                              : ""
                          }`}
                          required
                        />
                      </div>
                      <div>
                        {/* CEP */}
                        <input
                          type="text"
                          name="cep"
                          placeholder="CEP"
                          value={formData.cepFormatted || ""}
                          onChange={handleInputChange}
                          className={`w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                            invalidFields.includes("cep")
                              ? "border-red-500"
                              : ""
                          }`}
                          required
                        />
                      </div>
                      <div className="md:col-span-2 font-semibold text-gray-700 mt-2 mb-1">
                        Senha de Acesso
                      </div>
                      <div>
                        {/* Senha */}
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPassword ? "text" : "senha"}
                            name="senha"
                            placeholder="Criar senha"
                            value={formData.senha}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                              invalidFields.includes("senha")
                                ? "border-red-500"
                                : ""
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
                      </div>
                      <div>
                        {/* Confirmar Senha */}
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showConfirmPassword ? "text" : "senha"}
                            name="confirmPassword"
                            placeholder="Confirmar senha"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-black ${
                              invalidFields.includes("confirmPassword")
                                ? "border-red-500"
                                : ""
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-4">
                      <p>
                        Ao criar uma conta, você concorda com nossos{" "}
                        <button
                          type="button"
                          className="text-black hover:underline"
                        >
                          Termos de Serviço
                        </button>{" "}
                        e{" "}
                        <button
                          type="button"
                          className="text-black hover:underline"
                        >
                          Política de Privacidade
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="ml-2 text-black font-semibold hover:underline transition-all duration-200"
                >
                  {isLogin ? "Cadastre-se" : "Faça Login"}
                </button>
              </p>
            </div>
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
