import React from "react";
import PDVAccessButton, { PDVCodeDisplay } from "./PDVAccessButton";

const PDVExample = () => {
  const handleCopyCode = () => {
    // Exemplo de código para copiar
    navigator.clipboard.writeText("123456");
    alert("Código copiado!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Exemplos de Botão de Acesso PDV
        </h1>

        {/* Seção 1: Diferentes Variantes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Diferentes Variantes do Botão
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PDVAccessButton variant="default">Acesso PDV</PDVAccessButton>

            <PDVAccessButton variant="outline">Acesso PDV</PDVAccessButton>

            <PDVAccessButton variant="ghost">Acesso PDV</PDVAccessButton>

            <PDVAccessButton variant="primary">Acesso PDV</PDVAccessButton>
          </div>
        </section>

        {/* Seção 2: Diferentes Tamanhos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Diferentes Tamanhos
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            <PDVAccessButton size="sm">PDV Pequeno</PDVAccessButton>

            <PDVAccessButton size="default">PDV Normal</PDVAccessButton>

            <PDVAccessButton size="lg">PDV Grande</PDVAccessButton>
          </div>
        </section>

        {/* Seção 3: Exemplo de Código de Acesso */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Exemplo de Exibição de Código
          </h2>
          <div className="max-w-md mx-auto">
            <PDVCodeDisplay codigo="123456" onCopy={handleCopyCode} />
          </div>
        </section>

        {/* Seção 4: Uso em Contexto */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Uso em Contexto de Dashboard
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Sistema PDV
                </h3>
                <p className="text-gray-600">
                  Acesse seu sistema PDV com segurança
                </p>
              </div>
              <PDVAccessButton variant="primary" size="lg">
                Conectar PDV
              </PDVAccessButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">🔐</div>
                <div className="font-semibold">Login Seguro</div>
                <div className="text-gray-600">Autenticação com código</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">⚡</div>
                <div className="font-semibold">Acesso Rápido</div>
                <div className="text-gray-600">Código de 6 dígitos</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  🛡️
                </div>
                <div className="font-semibold">Proteção Total</div>
                <div className="text-gray-600">Expira em 30 min</div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 5: Instruções de Uso */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Como Usar
          </h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </span>
              <p>Clique no botão "Acesso PDV" para abrir a tela de login</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </span>
              <p>Digite seu email e senha empresarial</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                3
              </span>
              <p>Após login bem-sucedido, um código de 6 dígitos será gerado</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                4
              </span>
              <p>
                Use este código no seu sistema PDV para conectar ao servidor
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PDVExample;
