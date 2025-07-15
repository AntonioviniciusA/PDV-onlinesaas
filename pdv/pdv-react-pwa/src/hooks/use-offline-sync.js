import { useState, useEffect, useCallback } from "react";
import {
  salvarCupomOffline,
  recuperarCuponsOffline,
  limparCuponsOffline,
  contarCuponsOffline,
} from "../utils/cupom.utils";
import { buildApiUrl, apiRequest } from "../utils/api-config";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCupons, setPendingCupons] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Verificar status da conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncCuponsOffline();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Atualizar contador de cupons pendentes
  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await contarCuponsOffline();
      setPendingCupons(count);
    };

    updatePendingCount();

    // Atualizar a cada 5 segundos
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // Função para salvar cupom offline
  const salvarCupom = useCallback(
    async (cupom) => {
      try {
        if (!isOnline) {
          await salvarCupomOffline(cupom);
          setPendingCupons((prev) => prev + 1);
          return { success: true, offline: true };
        }
        return { success: true, offline: false };
      } catch (error) {
        console.error("Erro ao salvar cupom:", error);
        return { success: false, error };
      }
    },
    [isOnline]
  );

  // Função para sincronizar cupons offline
  const syncCuponsOffline = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const cupons = await recuperarCuponsOffline();

      if (cupons.length === 0) {
        setIsSyncing(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const cupom of cupons) {
        try {
          const response = await apiRequest(buildApiUrl("/api/cupom"), {
            method: "POST",
            body: JSON.stringify(cupom),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error("Erro ao enviar cupom:", error);
          errorCount++;
        }
      }

      // Se todos os cupons foram enviados com sucesso, limpar o cache
      if (errorCount === 0) {
        await limparCuponsOffline();
        setPendingCupons(0);

        // Mostrar notificação de sucesso
        if (successCount > 0) {
          showNotification(`${successCount} cupons sincronizados com sucesso!`);
        }
      } else {
        // Se houve erros, manter os cupons que falharam
        setPendingCupons(errorCount);
        showNotification(
          `${successCount} cupons sincronizados, ${errorCount} falharam.`
        );
      }
    } catch (error) {
      console.error("Erro na sincronização:", error);
      showNotification("Erro na sincronização dos cupons.");
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  // Função para mostrar notificações
  const showNotification = useCallback((message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Dominus PDV", {
        body: message,
        icon: "/logo192.png",
      });
    } else {
      // Fallback para toast ou alert
      console.log(message);
    }
  }, []);

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  return {
    isOnline,
    pendingCupons,
    isSyncing,
    salvarCupom,
    syncCuponsOffline,
    requestNotificationPermission,
  };
}
