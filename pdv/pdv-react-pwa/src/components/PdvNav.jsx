import React from "react";
import { Button } from "./ui/button";
import {
  DollarSign,
  Package,
  Tag,
  History,
  X,
  Settings,
  Maximize2,
  Minimize2,
  Circle,
} from "lucide-react";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import { useConfiguracoes } from "../hooks/useConfiguracoes";
import { useCaixa } from "../hooks/useCaixa";
import { useCaixaStatus } from "../hooks/useAuth";
import { UserDropdown } from "./UserDropdown";

export default function PdvNav({
  shortcuts = [],
  hasPermission = (user, module) => false,
  setShowCashManagement = () => {},
  setCashAction = () => {},
  navigate,
  onCloseNav,
  user,
}) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { configuracoes } = useConfiguracoes();
  const { cashSession, loading: caixaLoading } = useCaixa();
  const { data: caixaStatus } = useCaixaStatus();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.log("Erro ao entrar em tela cheia:", err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.log("Erro ao sair da tela cheia:", err);
        });
    }
  };

  // Listener para detectar mudanças no estado de tela cheia
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e) => {
      // F11 para alternar tela cheia
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="flex-shrink-0 p-4 border-b bg-black relative">
      {/* Botão para fechar o nav */}
      {onCloseNav && (
        <button
          className="absolute top-1 left-1 z-50 bg-white border rounded-full shadow p-1 hover:bg-gray-100 transition"
          onClick={onCloseNav}
          title="Fechar menu"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      )}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Indicador de status do caixa */}
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 gap-2 mx-2">
            {caixaLoading ? (
              <div className="text-white text-sm">Carregando...</div>
            ) : (
              <>
                <Circle
                  className={`w-3 h-3 ${
                    cashSession || caixaStatus
                      ? "text-green-400 fill-green-400"
                      : "text-red-400 fill-red-400"
                  }`}
                />
                <div className="text-white">
                  <div className="text-sm font-semibold">
                    {cashSession || caixaStatus
                      ? "Caixa Aberto"
                      : "Caixa Fechado"}
                  </div>
                  <div className="text-xs text-gray-300">
                    Nº{" "}
                    {(cashSession || caixaStatus)?.caixa_numero ||
                      configuracoes.numero_caixa ||
                      "N/A"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <KeyboardShortcutsHelp shortcuts={shortcuts} />

          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            title={
              isFullscreen
                ? "Sair da tela cheia (F11)"
                : "Entrar em tela cheia (F11)"
            }
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 mr-2" />
            ) : (
              <Maximize2 className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen ? "Sair Tela Cheia" : "Tela Cheia"}
            </span>
            <span className="sm:hidden">F11</span>
          </Button>

          <Button
            onClick={() => {
              setCashAction(cashSession || caixaStatus ? "close" : "open");
              setShowCashManagement(true);
            }}
            title={
              !hasPermission(user, "pdv.authorize")
                ? "Você não tem permissão para abrir ou fechar caixa"
                : ""
            }
            variant="outline"
            size="sm"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">
              {cashSession ? "Fechar Caixa" : "Abrir Caixa"}
            </span>
          </Button>

          <Button
            onClick={() => navigate("/produtos")}
            variant="outline"
            size="sm"
            disabled={!hasPermission(user, "pdv.products")}
          >
            <Package className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Produtos</span>
          </Button>
          <Button
            onClick={() => navigate("/etiquetas")}
            variant="outline"
            size="sm"
          >
            <Tag className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Etiquetas</span>
          </Button>
          <Button
            onClick={() => navigate("/historico")}
            variant="outline"
            size="sm"
          >
            <History className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Histórico (F6)</span>
            <span className="sm:hidden">F6</span>
          </Button>
          {(user?.perfil === "admin" ||
            user?.permissions?.includes("*") ||
            user?.permissions?.includes("admin") ||
            user?.permissions?.includes("manage.users")) && (
            <Button
              onClick={() => navigate("/configuracoes")}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Configurações</span>
            </Button>
          )}
          <UserDropdown user={user} />
        </div>
      </div>
    </div>
  );
}
