import React from "react";

export default function Logos() {
  // Para imagens, use <img> simples ou substitua por um placeholder
  const PlaceholderLogo = () => (
    <img
      src="/placeholder-logo.svg"
      alt="Company logo"
      width={120}
      height={60}
      className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
    />
  );

  return (
    <section className="w-full py-12 border-y bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Confiado por empresas inovadoras em todo o mundo
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <PlaceholderLogo key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
