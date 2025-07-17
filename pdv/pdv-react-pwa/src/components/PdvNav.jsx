import React from "react";
import { Button } from "./ui/button";
import { DollarSign, Package, Tag, History, X } from "lucide-react";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";

export default function PdvNav({
  shortcuts = [],
  hasPermission = () => true,
  cashSession,
  setShowLabelConfig = () => {},
  setShowCashManagement = () => {},
  setCashAction = () => {},
  navigate,
  onCloseNav,
}) {
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Sistema PDV - Caixa
          </h1>
          <p className="text-sm text-white">Ponto de Venda</p>
        </div>
        <div className="flex gap-2">
          <KeyboardShortcutsHelp shortcuts={shortcuts} />

          <Button
            onClick={() => {
              setCashAction(cashSession ? "close" : "open");
              setShowCashManagement(true);
            }}
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
        </div>
      </div>
    </div>
  );
}
