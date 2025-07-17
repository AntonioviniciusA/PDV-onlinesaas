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
import PdvProtectedRoute from "./utils/pdvProtectedRoute";
export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<AuthDialog />} />
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
    </Routes>
  );
}
