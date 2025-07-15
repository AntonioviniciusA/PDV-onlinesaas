import React from "react";
import { Bell, Shield, Globe, Palette, Monitor, Save } from "lucide-react";

const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Configurações Gerais
        </h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Notificações</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Notificações por Email
                  </p>
                  <p className="text-sm text-gray-500">
                    Receber atualizações importantes por email
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                  <span className="translate-x-6 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Notificações Push
                  </p>
                  <p className="text-sm text-gray-500">
                    Receber notificações no navegador
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                  <span className="translate-x-1 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Relatórios Semanais
                  </p>
                  <p className="text-sm text-gray-500">
                    Resumo semanal de atividades
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
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Segurança</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Autenticação de Dois Fatores
                  </p>
                  <p className="text-sm text-gray-500">
                    Adicionar uma camada extra de segurança
                  </p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Ativar
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Sessões Ativas
                  </p>
                  <p className="text-sm text-gray-500">
                    Gerenciar dispositivos conectados
                  </p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Gerenciar
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">Idioma e Região</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Português (Brasil)</option>
                  <option>English (US)</option>
                  <option>Español</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuso Horário
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>América/São_Paulo</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-gray-900">Aparência</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg">
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm">Sistema</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm">Claro</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm">Escuro</span>
                  </button>
                </div>
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

export default SettingsTab;
