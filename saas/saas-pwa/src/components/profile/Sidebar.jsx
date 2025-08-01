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
  Monitor,
} from "lucide-react";
import PDVAccessButton from "../landing-components/PDVAccessButton";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/authServices";

const Sidebar = ({ activeTab, onTabChange, userType }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.clearAuth();
    navigate("/");
  };

  const clientMenuItems = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "assinaturas", label: "Assinatura", icon: CreditCard },
    { id: "settings", label: "Configurações", icon: Settings },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "help", label: "Ajuda", icon: HelpCircle },
  ];

  const partnerMenuItems = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "settings", label: "Configurações", icon: Settings },
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
              </li>
            );
          })}
        </ul>

        {/* Botão de Acesso PDV - apenas para clientes */}
        {userType === "client" && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-500 mb-3 px-4">
              ACESSO PDV
            </div>
            <div className="px-2">
              <PDVAccessButton
                variant="outline"
                size="sm"
                className="w-full justify-center"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Acesso PDV
              </PDVAccessButton>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
