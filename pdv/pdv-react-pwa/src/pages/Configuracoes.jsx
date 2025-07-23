import React from "react";
import ImpressoraConfig from "../components/ImpressoraConfig";
// import AparenciaConfig from "../components/AparenciaConfig";

export default function Configuracoes() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Configurações do Sistema</h1>
      <div className="mb-8">
        <ImpressoraConfig />
      </div>
      {/* <div>
        <AparenciaConfig />
      </div> */}
    </div>
  );
}
