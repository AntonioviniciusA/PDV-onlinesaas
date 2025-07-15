import React from "react";
import {
  Shield,
  Server,
  Database,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const SystemTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Configurações do Sistema
          </h2>
        </div>

        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Server className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Status do Sistema</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      API Status
                    </p>
                    <p className="text-xs text-green-600">Operacional</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Banco de Dados
                    </p>
                    <p className="text-xs text-green-600">Conectado</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Manutenção
                    </p>
                    <p className="text-xs text-yellow-600">Agendada</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">Backup e Segurança</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Backup Automático
                  </p>
                  <p className="text-sm text-gray-500">
                    Backup diário dos dados dos clientes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Ativo</p>
                  <p className="text-xs text-gray-500">Último: 02:00 hoje</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Criptografia
                  </p>
                  <p className="text-sm text-gray-500">
                    Proteção de dados sensíveis
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">AES-256</p>
                  <p className="text-xs text-gray-500">Certificado SSL</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Auditoria</p>
                  <p className="text-sm text-gray-500">
                    Log de todas as atividades
                  </p>
                </div>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Ver Logs
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-gray-900">Monitoramento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  CPU Usage
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">45%</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Memory Usage
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "32%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">32%</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Disk Usage
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: "68%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">68%</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Network
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: "23%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">23%</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-5 h-5 text-indigo-600" />
              <h3 className="font-medium text-gray-900">
                Configurações Avançadas
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite de Requisições por Minuto
                </label>
                <input
                  type="number"
                  defaultValue="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout de Sessão (minutos)
                </label>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Modo de Manutenção
                  </p>
                  <p className="text-sm text-gray-500">
                    Ativar para manutenção do sistema
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                  <span className="translate-x-1 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Debug Mode
                  </p>
                  <p className="text-sm text-gray-500">
                    Ativar logs detalhados para debug
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                  <span className="translate-x-1 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-4">Ações do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="font-medium text-gray-900">
                  Reiniciar Sistema
                </div>
                <div className="text-sm text-gray-500">
                  Reiniciar todos os serviços
                </div>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="font-medium text-gray-900">Limpar Cache</div>
                <div className="text-sm text-gray-500">
                  Limpar cache do sistema
                </div>
              </button>
              <button className="p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-left">
                <div className="font-medium text-red-900">Backup Manual</div>
                <div className="text-sm text-red-500">
                  Criar backup imediato
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemTab;
