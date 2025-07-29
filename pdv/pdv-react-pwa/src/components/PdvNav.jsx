import React from "react";
import { Button } from "./ui/button";
import {
  DollarSign,
  Package,
  Tag,
  History,
  X,
  User,
  LogOut,
  Settings,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import { localAuthService } from "../services/localAuthService";

export default function PdvNav({
  shortcuts = [],
  hasPermission = (user, module) => false,
  cashSession,
  setShowCashManagement = () => {},
  setCashAction = () => {},
  navigate,
  onCloseNav,
  user,
}) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

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
          className="absolute top-7 left-2 z-50 bg-white border rounded-full shadow p-1 hover:bg-gray-100 transition"
          onClick={onCloseNav}
          title="Fechar menu"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      )}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Caixa</h1>
          <p className="text-sm text-white">Ponto de Venda</p>
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
              setCashAction(cashSession ? "close" : "open");
              setShowCashManagement(true);
            }}
            title={
              !hasPermission(user, "pdv.authorize", "write")
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
            disabled={!hasPermission(user, "pdv.products", "read")}
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
            user?.permissions?.includes("admin")) && (
            <Button
              onClick={() => navigate("/configuracoes")}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Configurações</span>
            </Button>
          )}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-center cursor-pointer">
            <User
              className="w-4 h-4"
              width={20}
              height={20}
              color="black"
              strokeWidth={2}
              fill="white"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-white font-bold">
              {user?.nome || "Usuário"}
            </p>
            <p className="text-xs text-white">{user?.perfil || "Perfil"}</p>
          </div>
          <div
            className="bg-white p-1 rounded-md border border-gray-300 flex items-center justify-center text-center cursor-pointer"
            onClick={() => localAuthService.clearAuth()}
          >
            <LogOut className="w-4 h-4 mr-2" color="black" strokeWidth={2} />
            <p className="text-xs text-black font-bold">Sair</p>
          </div>
        </div>
      </div>
    </div>
  );
}
