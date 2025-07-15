import React from "react";
import { Routes, Route } from "react-router-dom";
import PDVCaixa from "./pdv-caixa";
import AuthDialog from "./components/AuthDialog";
import LocalUsers from "./LocalUsers";
import Clientes from "./Clientes";
import Produtos from "./Produtos";
import Etiquetas from "./Etiquetas";
import Historico from "./Historico";

export default function Router() {
  return (
    <Routes>
      <Route path="/pdv" element={<PDVCaixa />} />
      <Route path="/login" element={<AuthDialog />} />
      <Route path="/usuarios" element={<LocalUsers />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/produtos" element={<Produtos />} />
      <Route path="/etiquetas" element={<Etiquetas />} />
      <Route path="/historico" element={<Historico />} />
    </Routes>
  );
}
