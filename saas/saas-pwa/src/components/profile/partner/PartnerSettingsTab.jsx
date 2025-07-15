import React from "react";
import { Building, CreditCard, Users, Globe, Mail, Save } from "lucide-react";

const PartnerSettingsTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Configurações da Empresa
        </h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Informações Gerais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razão Social
                </label>
                <input
                  type="text"
                  defaultValue="Tech Solutions LTDA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  defaultValue="12.345.678/0001-90"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  defaultValue="(11) 3333-4444"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  defaultValue="www.techsolutions.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">
                Configurações de Pagamento
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento das Comissões
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Transferência Bancária</option>
                  <option>PIX</option>
                  <option>Boleto</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banco
                  </label>
                  <input
                    type="text"
                    defaultValue="Banco do Brasil"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agência
                  </label>
                  <input
                    type="text"
                    defaultValue="1234-5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conta
                  </label>
                  <input
                    type="text"
                    defaultValue="12345-6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    defaultValue="contato@techsolutions.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">
                Gerenciamento de Clientes
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Aprovação Automática de Clientes
                  </p>
                  <p className="text-sm text-gray-500">
                    Novos clientes são aprovados automaticamente
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                  <span className="translate-x-6 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Limite de Clientes
                  </p>
                  <p className="text-sm text-gray-500">
                    Definir número máximo de clientes
                  </p>
                </div>
                <input
                  type="number"
                  defaultValue="100"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Notificações de Novos Clientes
                  </p>
                  <p className="text-sm text-gray-500">
                    Receber notificações quando novos clientes se cadastrarem
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                  <span className="translate-x-6 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-gray-900">Personalização</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo da Empresa
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Alterar Logo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Principal
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    defaultValue="#3B82F6"
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">#3B82F6</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domínio Personalizado
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    defaultValue="techsolutions"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">.plataforma.com</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-gray-900">Comunicação</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Email de Boas-vindas
                  </p>
                  <p className="text-sm text-gray-500">
                    Enviar email automático para novos clientes
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                  <span className="translate-x-6 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Relatórios Mensais
                  </p>
                  <p className="text-sm text-gray-500">
                    Receber relatórios mensais de desempenho
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                  <span className="translate-x-6 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerSettingsTab;
