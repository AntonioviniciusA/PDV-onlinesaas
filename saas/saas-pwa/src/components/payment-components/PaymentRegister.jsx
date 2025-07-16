import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Lock,
  Check,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Building,
  FileText,
  UserCheck,
  ExternalLink,
} from "lucide-react";

import { AssinaturaService } from "../../services/assinaturaService.js";
import { AuthService } from "../../services/authServices";

import { QRCodeSVG } from "qrcode.react";

const PaymentRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = location.state?.plan;
  console.log("selectedPlan", selectedPlan);

  // Redireciona para pricing se não houver plano selecionado
  useEffect(() => {
    if (!selectedPlan) {
      navigate("/#pricing");
    }
  }, [selectedPlan, navigate]);

  // Verifica autenticação ao montar
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        navigate("/login", { state: { from: "/payment" } });
      }
    };
    checkAuth();
  }, [navigate]);

  const [formData, setFormData] = useState({
    // Dados da empresa e representante
    companyName: "",
    representativeName: "",
    representativeDocument: "",
    documentType: "cpf", // 'cpf' ou 'cnpj'
    // Dados de contato
    email: "",
    // Dados de pagamento
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
    city: "",
    zipCode: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card", "boleto", "pix"
  const [pixData, setPixData] = useState(null); // Para exibir QR Code Pix

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDocument = (value, type) => {
    const v = value.replace(/\D/g, "");
    if (type === "cpf") {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : v;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData((prev) => ({ ...prev, expiryDate: formatted }));
  };

  const handleDocumentChange = (e) => {
    const formatted = formatDocument(e.target.value, formData.documentType);
    setFormData((prev) => ({ ...prev, representativeDocument: formatted }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    // Limpa campos de cartão se trocar para boleto/pix
    if (e.target.value !== "card") {
      setFormData((prev) => ({
        ...prev,
        cardNumber: "",
        expiryDate: "",
        cvv: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const body = {
        planId: selectedPlan.id,
        paymentData: { billingType: paymentMethod.toUpperCase() },
      };
      const response = await AssinaturaService.assinar(body);
      if (paymentMethod === "pix") {
        if (
          response.success &&
          response.data &&
          response.data.assas &&
          response.data.assas.pixQrCode
        ) {
          setPixData({
            qrCode: response.data.assas.pixQrCode.payload,
            copiaCola: response.data.assas.pixQrCode.payload,
          });
        } else {
          alert("Erro ao gerar QR Code Pix. Tente novamente.");
        }
      } else {
        alert("Pagamento processado com sucesso!");
        navigate("/");
      }
    } catch (err) {
      alert("Erro ao processar pagamento.");
    }
    setIsProcessing(false);
  };

  const subtotal = Number(selectedPlan?.preco) || 0;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + tax;

  const PrivacyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">
              Política de Privacidade
            </h2>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 text-gray-700">
            <h3 className="font-semibold text-black">
              1. Coleta de Informações
            </h3>
            <p>
              Coletamos informações que você nos fornece diretamente, como nome,
              email, dados da empresa e informações de pagamento quando você se
              inscreve em nossos serviços.
            </p>

            <h3 className="font-semibold text-black">2. Uso das Informações</h3>
            <p>
              Utilizamos suas informações para fornecer, manter e melhorar
              nossos serviços, processar pagamentos e comunicar com você sobre
              sua conta.
            </p>

            <h3 className="font-semibold text-black">
              3. Compartilhamento de Informações
            </h3>
            <p>
              Não vendemos, alugamos ou compartilhamos suas informações pessoais
              com terceiros, exceto conforme descrito nesta política ou com seu
              consentimento.
            </p>

            <h3 className="font-semibold text-black">4. Segurança</h3>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais
              apropriadas para proteger suas informações pessoais contra acesso
              não autorizado, alteração, divulgação ou destruição.
            </p>

            <h3 className="font-semibold text-black">5. Seus Direitos</h3>
            <p>
              Você tem o direito de acessar, atualizar ou excluir suas
              informações pessoais. Entre em contato conosco para exercer esses
              direitos.
            </p>

            <h3 className="font-semibold text-black">6. Contato</h3>
            <p>
              Se você tiver dúvidas sobre esta política, entre em contato
              conosco em privacy@empresa.com
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">Termos de Serviço</h2>
            <button
              onClick={() => setShowTermsModal(false)}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 text-gray-700">
            <h3 className="font-semibold text-black">
              1. Aceitação dos Termos
            </h3>
            <p>
              Ao usar nossos serviços, você concorda em ficar vinculado a estes
              termos de serviço e todas as leis e regulamentos aplicáveis.
            </p>

            <h3 className="font-semibold text-black">
              2. Descrição do Serviço
            </h3>
            <p>
              Fornecemos uma plataforma SaaS que permite gerenciar e otimizar
              processos empresariais através de nossa interface web.
            </p>

            <h3 className="font-semibold text-black">
              3. Pagamento e Cobrança
            </h3>
            <p>
              Os pagamentos são processados mensalmente ou anualmente, conforme
              o plano escolhido. Todas as taxas são não reembolsáveis, exceto
              conforme exigido por lei.
            </p>

            <h3 className="font-semibold text-black">4. Uso Aceitável</h3>
            <p>
              Você concorda em usar nossos serviços apenas para fins legais e de
              acordo com todas as leis aplicáveis. É proibido usar o serviço
              para atividades ilegais ou não autorizadas.
            </p>

            <h3 className="font-semibold text-black">5. Cancelamento</h3>
            <p>
              Você pode cancelar sua assinatura a qualquer momento. O
              cancelamento entrará em vigor no final do período de cobrança
              atual.
            </p>

            <h3 className="font-semibold text-black">
              6. Limitação de Responsabilidade
            </h3>
            <p>
              Nossa responsabilidade é limitada ao valor pago por você pelos
              serviços no período de 12 meses anterior ao evento que deu origem
              à reivindicação.
            </p>

            <h3 className="font-semibold text-black">7. Modificações</h3>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer
              momento. As modificações entrarão em vigor imediatamente após a
              publicação.
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowTermsModal(false)}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Pagamento Seguro</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Dados da Empresa
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="Empresa LTDA"
                    required
                  />
                </div>
              </div>

              {/* Representative Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Representante Legal
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Representante *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="representativeName"
                      value={formData.representativeName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="João Silva"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento *
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      required
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.documentType === "cpf" ? "CPF" : "CNPJ"} *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="representativeDocument"
                        value={formData.representativeDocument}
                        onChange={handleDocumentChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        placeholder={
                          formData.documentType === "cpf"
                            ? "000.000.000-00"
                            : "00.000.000/0000-00"
                        }
                        maxLength={formData.documentType === "cpf" ? 14 : 18}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contato
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email para Cobrança *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="contato@empresa.com"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Método de Pagamento
                </h2>
                {/* Seletor de método */}
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={handlePaymentMethodChange}
                    />
                    <span>Cartão de Crédito</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="boleto"
                      checked={paymentMethod === "boleto"}
                      onChange={handlePaymentMethodChange}
                    />
                    <span>Boleto</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pix"
                      checked={paymentMethod === "pix"}
                      onChange={handlePaymentMethodChange}
                    />
                    <span>Pix</span>
                  </label>
                </div>
                {/* Campos condicionais */}
                {paymentMethod === "card" && (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número do Cartão *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required={paymentMethod === "card"}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Validade *
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleExpiryChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                              placeholder="MM/AA"
                              maxLength={5}
                              required={paymentMethod === "card"}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            placeholder="123"
                            maxLength={4}
                            required={paymentMethod === "card"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {paymentMethod === "boleto" && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-white">
                    <p className="text-gray-700 mb-2">
                      O boleto será gerado após a confirmação. Enviaremos para o
                      e-mail informado acima.
                    </p>
                  </div>
                )}
                {paymentMethod === "pix" && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-white">
                    <p className="text-gray-700 mb-2">
                      O QR Code Pix será gerado após a confirmação. Enviaremos
                      para o e-mail informado acima.
                    </p>
                  </div>
                )}
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                  Endereço de Cobrança
                </h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="Endereço completo"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Cidade"
                      required
                    />

                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="CEP"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Signature */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Eu,{" "}
                    <strong>
                      {formData.representativeName || "[Nome do Representante]"}
                    </strong>
                    , representante legal da empresa{" "}
                    <strong>
                      {formData.companyName || "[Nome da Empresa]"}
                    </strong>
                    , portador do documento{" "}
                    <strong>
                      {formData.representativeDocument ||
                        `[${formData.documentType.toUpperCase()}]`}
                    </strong>
                    , declaro ter lido e concordo com os{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-black underline hover:text-gray-700 inline-flex items-center"
                    >
                      termos de serviço
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>{" "}
                    e{" "}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-black underline hover:text-gray-700 inline-flex items-center"
                    >
                      política de privacidade
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                    , autorizando a cobrança recorrente conforme o plano
                    selecionado.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              {!pixData && (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processando Assinatura...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5" />
                      <span>Assinar e Confirmar Pagamento</span>
                    </>
                  )}
                </button>
              )}
              {/* Exibir QR Code Pix se disponível */}
              {pixData && (
                <div className="flex flex-col items-center space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-black">
                    Pague com Pix
                  </h3>
                  <QRCodeSVG value={pixData.qrCode} size={200} />
                  <div className="bg-gray-100 rounded-lg p-2 text-xs break-all select-all">
                    {pixData.copiaCola}
                  </div>
                  <span className="text-gray-600 text-sm">
                    Copie o código acima ou escaneie o QR Code no app do seu
                    banco.
                  </span>
                </div>
              )}
            </form>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-black">
                  Resumo da Assinatura
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-black">
                        {selectedPlan?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedPlan?.isYearly
                          ? "Cobrança anual"
                          : "Cobrança mensal"}
                      </p>
                    </div>
                    <span className="font-semibold text-black">
                      R$ {selectedPlan?.preco} / mês
                    </span>
                  </div>

                  {selectedPlan?.isYearly && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-black" />
                        <span className="text-sm font-medium text-black">
                          Economia anual: 20%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {selectedPlan?.preco}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Impostos</span>
                    <span>R$ {tax}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-black border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>R$ {total}</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-black">
                        Assinatura Digital Segura
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Documento com validade jurídica e criptografia SSL 256
                        bits
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-2">
                  <p>• Cancele a qualquer momento</p>
                  <p>• Suporte jurídico 24/7</p>
                  <p>• Garantia de 30 dias</p>
                  <p>• Documento assinado digitalmente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPrivacyModal && <PrivacyModal />}
      {showTermsModal && <TermsModal />}
    </>
  );
};

export default PaymentRegister;
