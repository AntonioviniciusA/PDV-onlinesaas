import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TypeAnimation } from "react-type-animation";
import PDVIMAGE from "../../assets/image/PDV.png";

export default function Hero() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <Badge
            className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium"
            variant="secondary"
          >
            Em Breve
          </Badge>
          <div className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            <TypeAnimation
              sequence={[
                "Transforme seu Negócio com o NeoCaixa PDV",
                2000,
                "Gerencie Vendas com o NeoCaixa PDV",
                2000,
                "Automatize Processos com o NeoCaixa PDV",
                2000,
              ]}
              wrapper="h1"
              speed={30}
              // repeat={0}
              className="inline-block"
              cursor="|" // Cursor diferente
              deletionSpeed={30} // Velocidade de deletar
              delay={200} // Esperar 500ms antes de começar
            />
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            <TypeAnimation
              sequence={[
                "A plataforma completa que ajuda empresas a gerenciar vendas, automatizar processos e entregar resultados excepcionais. Simplifique suas operações e foque no que realmente importa.",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={0}
              className="inline-block"
            />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full h-12 px-8 text-base">
              Teste Grátis
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-12 px-8 text-base"
            >
              Agendar Demo
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="size-4 text-primary" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="size-4 text-primary" />
              <span>Teste de 7 dias</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="size-4 text-primary" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto max-w-5xl"
        >
          <div className="rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20">
            <img
              src={PDVIMAGE}
              width={1280}
              height={720}
              alt="NeoCaixa PDV dashboard"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
          </div>
          <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70"></div>
          <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70"></div>
        </motion.div>
      </div>
    </section>
  );
}
