import React from "react";
import ImpressoraConfig from "../components/ImpressoraConfig";
import ConfiguracoesSistema from "../components/ConfiguracoesSistema";
import { BtnVoltarPDV } from "../components/BtnVoltarPDV";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Settings, Printer, Palette } from "lucide-react";
// import AparenciaConfig from "../components/AparenciaConfig";

export default function Configuracoes() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        <BtnVoltarPDV />
      </div>

      <Tabs defaultValue="sistema" className="w-full">
        <TabsList className="grid w-full h-15 grid-cols-1 sm:grid-cols-3 gap-1">
          <TabsTrigger
            value="sistema"
            className="flex items-center gap-1 py-3  "
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
            <span className="sm:hidden">Sistema</span>
          </TabsTrigger>
          <TabsTrigger
            value="impressora"
            className="flex items-center gap-2 py-3"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Impressora</span>
            <span className="sm:hidden">Impr.</span>
          </TabsTrigger>
          <TabsTrigger
            value="aparencia"
            className="flex items-center gap-2 py-3"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
            <span className="sm:hidden">Apar.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sistema" className="mt-2">
          <ConfiguracoesSistema />
        </TabsContent>

        <TabsContent value="impressora" className="mt-2">
          <ImpressoraConfig />
        </TabsContent>

        <TabsContent value="aparencia" className="mt-2">
          <div className="text-center py-12 text-muted-foreground">
            <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Configurações de Aparência
            </h3>
            <p className="text-sm mb-4">
              Personalize a aparência do sistema PDV.
            </p>
            <div className="max-w-md mx-auto space-y-3 text-left">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Temas de cores</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Tipografia personalizada</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm">Layout responsivo</span>
              </div>
            </div>
            <p className="text-xs mt-6 opacity-75">
              Em desenvolvimento - disponível em breve
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
