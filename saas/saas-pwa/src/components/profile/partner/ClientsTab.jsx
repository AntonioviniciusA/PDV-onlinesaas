import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Crown,
  Star,
} from "lucide-react";

const ClientsTab = () => {
  const [selectedClient, setSelectedClient] = useState(null);

  const clients = [
    {
      id: "1",
      name: "João Silva",
      email: "joao.silva@email.com",
      plan: "Premium",
      status: "Ativo",
      revenue: "R$ 99,90",
      joinDate: "2024-01-15",
      satisfaction: 5,
    },
    {
      id: "2",
      name: "Ana Costa",
      email: "ana.costa@email.com",
      plan: "Basic",
      status: "Ativo",
      revenue: "R$ 49,90",
      joinDate: "2024-01-20",
      satisfaction: 4,
    },
    {
      id: "3",
      name: "Carlos Mendes",
      email: "carlos.mendes@email.com",
      plan: "Premium",
      status: "Pendente",
      revenue: "R$ 99,90",
      joinDate: "2024-02-01",
      satisfaction: 5,
    },
    {
      id: "4",
      name: "Luciana Santos",
      email: "luciana.santos@email.com",
      plan: "Pro",
      status: "Ativo",
      revenue: "R$ 199,90",
      joinDate: "2024-01-10",
      satisfaction: 4,
    },
  ];

  const handleClientSession = (clientId) => {
    setSelectedClient(clientId);
    // Aqui você implementaria a lógica para abrir a sessão do cliente
    console.log(`Abrindo sessão do cliente: ${clientId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Inativo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case "Premium":
      case "Pro":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      default:
        return <Star className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Clientes</h2>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar clientes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Plano
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Receita
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Satisfação
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getPlanIcon(client.plan)}
                      <span className="text-sm font-medium text-gray-900">
                        {client.plan}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        client.status
                      )}`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">
                      {client.revenue}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < client.satisfaction
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleClientSession(client.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Abrir sessão do cliente"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total de Clientes
              </p>
              <p className="text-2xl font-bold text-gray-900">43</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+3 este mês</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Clientes Ativos
              </p>
              <p className="text-2xl font-bold text-gray-900">41</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">95% taxa de atividade</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Receita Mensal
              </p>
              <p className="text-2xl font-bold text-gray-900">R$ 4.2k</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+12% vs mês anterior</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Satisfação Média
              </p>
              <p className="text-2xl font-bold text-gray-900">4.6</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">Muito alta</p>
        </div>
      </div>

      {selectedClient && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            Sessão do Cliente Ativa
          </h3>
          <p className="text-sm text-blue-800">
            Você está visualizando a sessão do cliente:{" "}
            <strong>
              {clients.find((c) => c.id === selectedClient)?.name}
            </strong>
          </p>
          <button
            onClick={() => setSelectedClient(null)}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Fechar Sessão
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientsTab;
