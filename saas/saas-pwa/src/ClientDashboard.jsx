import React, { useState } from "react";
import Sidebar from "./components/profile/Sidebar";
import Header from "./components/profile/Header";
import ProfileTab from "./components/profile/client/ProfileTab";
import SubscriptionTab from "./components/profile/client/SubscriptionTab";
import SettingsTab from "./components/profile/client/SettingsTab";
import { Bell, HelpCircle } from "lucide-react";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "subscription":
        return <SubscriptionTab />;
      case "settings":
        return <SettingsTab />;
      case "notifications":
        return (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Notificações
            </h3>
            <p className="text-gray-600">Suas notificações aparecerão aqui.</p>
          </div>
        );
      case "help":
        return (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <HelpCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Central de Ajuda
            </h3>
            <p className="text-gray-600">
              Encontre respostas para suas dúvidas.
            </p>
          </div>
        );
      default:
        return <ProfileTab />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "profile":
        return "Perfil";
      case "subscription":
        return "Assinatura";
      case "settings":
        return "Configurações";
      case "notifications":
        return "Notificações";
      case "help":
        return "Ajuda";
      default:
        return "Perfil";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userType="client"
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTabTitle()} userType="client" />
        <main className="flex-1 overflow-y-auto p-6">{renderActiveTab()}</main>
      </div>
    </div>
  );
};

export default ClientDashboard;
