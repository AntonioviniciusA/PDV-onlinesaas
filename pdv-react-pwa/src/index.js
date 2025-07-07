import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./landing-page";
import PDVCaixa from "./pdv-caixa";
import PaymentRegister from "./components/payment-components/PaymentRegister";
import "./index.css";
import "./globals.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pdv" element={<PDVCaixa />} />
        <Route path="/payment" element={<PaymentRegister />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

serviceWorkerRegistration.unregister();
