import React, { useState } from "react";
import Sidebar from "./components/profile/Sidebar";
import Header from "./components/profile/Header";
import PartnerProfileTab from "./components/profile/partner/PartnerProfileTab";
import ClientsTab from "./components/profile/partner/ClientsTab";
import PartnerSettingsTab from "./components/profile/partner/PartnerSettingsTab";
import SystemTab from "./components/profile/partner/SystemTab";
import { Bell, HelpCircle } from "lucide-react";

const PartnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <PartnerProfileTab />;
      case "clients":
        return <ClientsTab />;
      case "settings":
        return <PartnerSettingsTab />;
      case "system":
        return <SystemTab />;
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
        return <PartnerProfileTab />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "profile":
        return "Perfil";
      case "clients":
        return "Clientes";
      case "settings":
        return "Configurações";
      case "system":
        return "Sistema";
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
        userType="partner"
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTabTitle()} userType="partner" />
        <main className="flex-1 overflow-y-auto p-6">{renderActiveTab()}</main>
      </div>
    </div>
  );
};

export default PartnerDashboard;
