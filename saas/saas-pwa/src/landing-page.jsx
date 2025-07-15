import React from "react";
import {
  Header,
  Hero,
  Logos,
  Features,
  HowItWorks,
  Pricing,
  FAQ,
  CTA,
  Footer,
  // Testimonials,
} from "./components/landing-components";

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Logos />
        <Features />
        <HowItWorks />
        {/* <Testimonials /> */}
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
