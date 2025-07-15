import React from "react";
import ClientesDialog from "./components/clientes-dialog";

export default function Clientes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8">
        <ClientesDialog />
      </div>
    </div>
  );
}
