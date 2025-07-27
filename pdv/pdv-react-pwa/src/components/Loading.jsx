import React from "react";

export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      <span className="ml-4 text-lg font-semibold">Carregando...</span>
    </div>
  );
}
