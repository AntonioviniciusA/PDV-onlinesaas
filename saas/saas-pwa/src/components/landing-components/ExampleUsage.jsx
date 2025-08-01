import React, { useState } from "react";
import AuthDialogWithAccessCode from "./AuthDialogWithAccessCode";

const ExampleUsage = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleAuthSuccess = (data) => {
    console.log("Login bem-sucedido:", data);
    // Aqui você pode fazer o que quiser com os dados do login
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Exemplo de Uso - Login com Código de Acesso
        </h1>
        <p className="text-gray-600 mb-8">
          Clique no botão abaixo para abrir a tela de login que gera código de
          acesso
        </p>

        <button
          onClick={() => setShowAuthDialog(true)}
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Abrir Login com Código de Acesso
        </button>

        {showAuthDialog && (
          <AuthDialogWithAccessCode
            isOpen={showAuthDialog}
            onClose={() => setShowAuthDialog(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default ExampleUsage;
