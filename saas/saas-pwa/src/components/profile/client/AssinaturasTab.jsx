import React, { useEffect, useState } from "react";
import { CreditCard, Calendar, Check, AlertCircle, Crown } from "lucide-react";
import { AssinaturaService } from "../../../services/assinaturaService";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";

const AssinaturasTab = () => {
  const [assinatura, setAssinatura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalError, setModalError] = useState("");
  const navigate = useNavigate();
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");

  useEffect(() => {
    const fetchAssinatura = async () => {
      try {
        const response = await AssinaturaService.listarAssinaturas();
        // console.log("response", response);
        if (response && response.data) {
          setAssinatura(response.data[0]);
        } else {
          setAssinatura(null);
        }
      } catch (err) {
        setAssinatura(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAssinatura();
  }, []);

  if (loading) {
    return <div>Carregando assinatura...</div>;
  }

  if (!assinatura) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-lg text-gray-700 mb-4">
          Você ainda não possui uma assinatura ativa.
        </p>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate("/#pricing")}
        >
          Ver Planos e Assinar
        </button>
      </div>
    );
  }

  // Função para cancelar assinatura (exemplo, ajuste conforme seu serviço)
  const handleCancelarAssinatura = async () => {
    setModalMsg("");
    setModalError("");
    try {
      if (assinatura.status !== "active") {
        setModalError("Sua assinatura não está ativa para ser cancelada.");
        return;
      }
      const response = await AssinaturaService.cancelarAssinatura(
        assinatura.id
      );
      if (response && response.success) {
        setModalMsg("Assinatura cancelada com sucesso!");
        // Atualiza a tela (recarrega assinaturas)
        setTimeout(() => {
          setShowModal(false);
          window.location.reload();
        }, 1500);
      } else {
        setModalError(response?.message || "Erro ao cancelar assinatura.");
      }
    } catch (err) {
      setModalError("Erro ao cancelar assinatura. Tente novamente.");
    }
  };

  // Função para atualizar forma de pagamento (exemplo)
  const handleAtualizarPagamento = () => {
    setModalMsg("");
    setModalError("");
    // Aqui você pode redirecionar para uma tela de atualização ou abrir outro modal
    setModalMsg("Funcionalidade de atualização de pagamento em breve.");
  };

  // Função para buscar histórico de pagamentos
  const handleShowPayments = async () => {
    setShowPaymentsModal(true);
    setLoadingPayments(true);
    setPaymentsError("");
    try {
      const response = await AssinaturaService.listarPagamentos(
        assinatura.assas_id_assinatura
      );
      if (response && response.data) {
        setPayments(response.data);
      } else {
        setPayments([]);
        setPaymentsError("Nenhum pagamento encontrado.");
      }
    } catch (err) {
      setPaymentsError("Erro ao buscar histórico de pagamentos.");
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Plano Atual</h2>
          <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <Crown className="w-4 h-4 mr-1" />
            {assinatura.nome}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Valor</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {assinatura.valor}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Próxima Cobrança
                </p>
                <p className="text-gray-900">
                  {new Date(assinatura.data_cobranca).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Check className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ciclo</p>
                <p className="text-gray-900">{assinatura.ciclo_cobranca}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Check className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-gray-900">{assinatura.status}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Check className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Início</p>
                <p className="text-gray-900">
                  {new Date(assinatura.data_inicio).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Check className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fim</p>
                <p className="text-gray-900">
                  {new Date(assinatura.data_fim).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Recursos Inclusos</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Projetos ilimitados
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Suporte prioritário
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">API avançada</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Integrações premium
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog.Root open={showModal} onOpenChange={setShowModal}>
              <Dialog.Trigger asChild>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Gerenciar Assinatura
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                  <Dialog.Title className="text-lg font-bold mb-4">
                    Gerenciar Assinatura
                  </Dialog.Title>
                  {modalMsg && (
                    <div className="text-green-600 mb-2">{modalMsg}</div>
                  )}
                  {modalError && (
                    <div className="text-red-600 mb-2">{modalError}</div>
                  )}
                  <div className="flex flex-col gap-4">
                    <button
                      className="w-full bg-red-600 text-white disabled:opacity-40 py-2 rounded hover:bg-red-700"
                      onClick={handleCancelarAssinatura}
                      disabled={assinatura.status !== "active"}
                    >
                      {assinatura.status !== "active"
                        ? "Assinatura não ativa"
                        : "Cancelar Assinatura"}
                    </button>
                    {assinatura.status === "active" && (
                      <button
                        className="w-full bg-blue-500 text-white disabled:opacity-40 py-2 rounded hover:bg-blue-600"
                        onClick={handleAtualizarPagamento}
                        disabled={assinatura.status !== "active"}
                      >
                        Atualizar Forma de Pagamento
                      </button>
                    )}
                    <Dialog.Close asChild>
                      <button className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                        Fechar
                      </button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <Dialog.Root
              open={showPaymentsModal}
              onOpenChange={setShowPaymentsModal}
            >
              <Dialog.Trigger asChild>
                <button
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleShowPayments}
                >
                  Histórico de Pagamentos
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                  <Dialog.Title className="text-lg font-bold mb-4">
                    Histórico de Pagamentos
                  </Dialog.Title>
                  {loadingPayments && <div>Carregando pagamentos...</div>}
                  {paymentsError && (
                    <div className="text-red-600 mb-2">{paymentsError}</div>
                  )}
                  {!loadingPayments &&
                    !paymentsError &&
                    payments.length === 0 && (
                      <div>Nenhum pagamento encontrado.</div>
                    )}
                  {!loadingPayments && payments.length > 0 && (
                    <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
                      {payments.map((p) => (
                        <li key={p.id} className="py-2 flex flex-col">
                          <span className="font-medium">R$ {p.value}</span>
                          <span className="text-xs text-gray-500">
                            Vencimento:{" "}
                            {new Date(p.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Status: {p.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Dialog.Close asChild>
                    <button className="w-full mt-4 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                      Fechar
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            {/* <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Upgrade de Plano
            </button> */}
          </div>
        </div>
      </div>

      {/* <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Uso do Plano
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Data de Início
              </span>
              <span className="text-sm text-gray-500">
                {assinatura.data_inicio}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Data de Fim
              </span>
              <span className="text-sm text-gray-500">
                {assinatura.data_fim}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Próxima Cobrança
              </span>
              <span className="text-sm text-gray-500">
                {assinatura.data_cobranca}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <span className="text-sm text-gray-500">{assinatura.status}</span>
            </div>
          </div>
        </div>
      </div> */}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div>
            <h4 className="font-medium text-amber-800">Renovação Automática</h4>
            <p className="text-sm text-amber-700">
              Sua assinatura será renovada automaticamente em{" "}
              {new Date(assinatura.data_cobranca).toLocaleDateString()}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssinaturasTab;
