import React from "react";
import { Routes, Route } from "react-router-dom";
import PDVCaixa from "./pages/pdv-caixa";
import AuthDialog from "./components/AuthDialog";
import LocalUsers from "./pages/LocalUsers";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Etiquetas from "./pages/Etiquetas";
import Historico from "./pages/Historico";
import PrivateRoute from "./utils/privateRoute";
import PdvProtectedRoute from "./utils/pdvProtectedRoute";
import Login from "./pages/Login";
import Configuracoes from "./pages/Configuracoes";
import { Toaster } from "./components/ui/toaster";
export default function Router() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AuthDialog />} />
        <Route path="/llogin" element={<Login />} />
        <Route
          path="/pdv"
          element={
            <PrivateRoute>
              {/* <PdvProtectedRoute requiredPermissions={["pdv.operate"]}> */}
              <PDVCaixa />
              {/* </PdvProtectedRoute> */}
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <PdvProtectedRoute requiredPermissions={["*", "admin"]}>
                <LocalUsers />
              </PdvProtectedRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <PdvProtectedRoute
                requiredPermissions={["pdv.operate", "pdv.authorize"]}
              >
                <Clientes />
              </PdvProtectedRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/produtos"
          element={
            <PrivateRoute>
              <PdvProtectedRoute requiredPermissions={["products.manage"]}>
                <Produtos />
              </PdvProtectedRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/etiquetas"
          element={
            <PrivateRoute>
              <PdvProtectedRoute requiredPermissions={["labels.config"]}>
                <Etiquetas />
              </PdvProtectedRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/historico"
          element={
            <PrivateRoute>
              <PdvProtectedRoute requiredPermissions={["reports.view"]}>
                <Historico />
              </PdvProtectedRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <PrivateRoute>
              <PdvProtectedRoute requiredPermissions={["*"]}>
                <Configuracoes />
              </PdvProtectedRoute>
            </PrivateRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}
