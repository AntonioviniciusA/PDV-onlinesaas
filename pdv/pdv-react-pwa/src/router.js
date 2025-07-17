import React from "react";
import { Routes, Route } from "react-router-dom";
import PDVCaixa from "./pdv-caixa";
import AuthDialog from "./components/AuthDialog";
import LocalUsers from "./LocalUsers";
import Clientes from "./Clientes";
import Produtos from "./Produtos";
import Etiquetas from "./Etiquetas";
import Historico from "./Historico";
import PrivateRoute from "./utils/privateRoute";
export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<AuthDialog />} />
      <Route
        path="/pdv"
        element={
          <PrivateRoute>
            <PDVCaixa />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <LocalUsers />
          </PrivateRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <PrivateRoute>
            <Clientes />
          </PrivateRoute>
        }
      />
      <Route
        path="/produtos"
        element={
          <PrivateRoute>
            <Produtos />
          </PrivateRoute>
        }
      />
      <Route
        path="/etiquetas"
        element={
          <PrivateRoute>
            <Etiquetas />
          </PrivateRoute>
        }
      />
      <Route
        path="/historico"
        element={
          <PrivateRoute>
            <Historico />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
