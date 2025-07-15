import React from "react";
import {
  User,
  CreditCard,
  Settings,
  Users,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";

const Sidebar = ({ activeTab, onTabChange, userType }) => {
  const clientMenuItems = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "subscription", label: "Assinatura", icon: CreditCard },
    { id: "settings", label: "Configurações", icon: Settings },
    { id: "usuarios", label: "Usuários", icon: Users, path: "/usuarios" },
    { id: "clientes", label: "Clientes", icon: Users, path: "/clientes" },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "help", label: "Ajuda", icon: HelpCircle },
  ];

  const partnerMenuItems = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "settings", label: "Configurações", icon: Settings },
    { id: "usuarios", label: "Usuários", icon: Users, path: "/usuarios" },
    { id: "clientes", label: "Clientes", icon: Users, path: "/clientes" },
    { id: "system", label: "Sistema", icon: Shield },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "help", label: "Ajuda", icon: HelpCircle },
  ];

  const menuItems = userType === "client" ? clientMenuItems : partnerMenuItems;

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">
          {userType === "client" ? "Cliente Dashboard" : "Parceiro Dashboard"}
        </h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                {item.path ? (
                  <a
                    href={item.path}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
