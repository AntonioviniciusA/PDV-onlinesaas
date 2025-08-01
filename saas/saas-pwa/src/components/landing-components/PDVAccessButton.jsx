import React, { useState } from "react";
import { Monitor, Key } from "lucide-react";
import PDVLoginDialog from "./PDVLoginDialog";

const PDVAccessButton = ({
  variant = "default",
  size = "default",
  className = "",
  children,
}) => {
  const [showPDVLogin, setShowPDVLogin] = useState(false);

  const handleAuthSuccess = (data) => {
    console.log("Login PDV bem-sucedido:", data);
    // Aqui você pode fazer o que quiser com os dados do login PDV
  };

  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default: "bg-black text-white hover:bg-gray-800 focus:ring-gray-500",
    outline:
      "border-2 border-black text-black hover:bg-black hover:text-white focus:ring-black",
    ghost: "text-black hover:bg-gray-100 focus:ring-gray-500",
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-lg",
    default: "px-4 py-3 rounded-lg",
    lg: "px-6 py-4 text-lg rounded-xl",
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <>
      <button onClick={() => setShowPDVLogin(true)} className={buttonClasses}>
        <Monitor className="w-5 h-5 mr-2" />
        {children || "Acesso PDV"}
      </button>

      {showPDVLogin && (
        <PDVLoginDialog
          isOpen={showPDVLogin}
          onClose={() => setShowPDVLogin(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
};

// Componente específico para exibir código de acesso
export const PDVCodeDisplay = ({ codigo, onCopy }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      onCopy && onCopy("Código copiado para a área de transferência!");
    } catch (err) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = codigo;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      onCopy && onCopy("Código copiado para a área de transferência!");
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-5 h-5 text-gray-600" />
        <span className="font-semibold text-gray-700">
          Código de Acesso PDV
        </span>
      </div>

      <div className="text-3xl font-mono font-bold text-black tracking-wider mb-3">
        {codigo}
      </div>

      <button
        onClick={handleCopy}
        className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
      >
        Copiar Código
      </button>
    </div>
  );
};

export default PDVAccessButton;
