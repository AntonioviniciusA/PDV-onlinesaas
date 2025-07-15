import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./landing-page";
import PaymentRegister from "./components/payment-components/PaymentRegister";
import AuthDialog from "./components/landing-components/AuthDialog";
import ClientDashboard from "./ClientDashboard";
import PartnerDashboard from "./PartnerDashboard";
import VerificarEmail from "./verificar-email";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/payment" element={<PaymentRegister />} />
      <Route path="/login" element={<AuthDialog />} />
      <Route path="/verificar-email" element={<VerificarEmail />} />
      <Route
        path="/cliente/perfil"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/parceiro/perfil" element={<PartnerDashboard />} />
    </Routes>
  );
}
