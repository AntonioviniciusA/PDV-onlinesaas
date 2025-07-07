import React from "react";
import { useOfflineSync } from "../hooks/use-offline-sync";

export function OfflineStatus() {
  const { isOnline, pendingCupons, isSyncing, syncCuponsOffline } =
    useOfflineSync();

  if (isOnline && pendingCupons === 0) {
    return null; // Não mostrar nada quando estiver online e sem cupons pendentes
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Status da conexão */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Offline</span>
        </div>
      )}

      {/* Cupons pendentes */}
      {pendingCupons > 0 && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-sm font-medium">
            {pendingCupons} cupon{pendingCupons > 1 ? "s" : ""} pendente
            {pendingCupons > 1 ? "s" : ""}
          </span>
          {isOnline && !isSyncing && (
            <button
              onClick={syncCuponsOffline}
              className="ml-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded text-xs transition-colors"
            >
              Sincronizar
            </button>
          )}
          {isSyncing && (
            <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {/* Notificação de sincronização */}
      {isOnline && pendingCupons === 0 && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-sm font-medium">Sincronizado</span>
        </div>
      )}
    </div>
  );
}

// Estilos CSS para animação
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;

// Adicionar estilos ao head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
