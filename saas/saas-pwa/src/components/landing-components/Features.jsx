import React from "react";
import { motion } from "framer-motion";
import { Zap, Shield, Users, BarChart, Layers, Star } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

export default function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const features = [
    {
      title: "Automação Inteligente",
      description:
        "Automatize tarefas repetitivas e fluxos de trabalho para economizar tempo e reduzir erros.",
      icon: <Zap className="size-5" />,
    },
    {
      title: "Analytics Avançado",
      description:
        "Obtenha insights valiosos com visualização de dados em tempo real e relatórios detalhados.",
      icon: <BarChart className="size-5" />,
    },
    {
      title: "Colaboração em Equipe",
      description:
        "Trabalhe em conjunto perfeitamente com ferramentas de comunicação integradas.",
      icon: <Users className="size-5" />,
    },
    {
      title: "Segurança Empresarial",
      description:
        "Mantenha seus dados seguros com criptografia de ponta a ponta e recursos de conformidade.",
      icon: <Shield className="size-5" />,
    },
    {
      title: "Integração Perfeita",
      description:
        "Conecte-se com suas ferramentas favoritas através do nosso extenso ecossistema de APIs.",
      icon: <Layers className="size-5" />,
    },
    {
      title: "Suporte 24/7",
      description:
        "Obtenha ajuda sempre que precisar com nossa equipe de suporte dedicada.",
      icon: <Star className="size-5" />,
    },
  ];

  return (
    <section id="features" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge
            className="rounded-full px-4 py-1.5 text-sm font-medium"
            variant="secondary"
          >
            Recursos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tudo que Você Precisa para Ter Sucesso
          </h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Nossa plataforma completa fornece todas as ferramentas necessárias
            para otimizar seu fluxo de trabalho, aumentar a produtividade e
            alcançar seus objetivos.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={item}>
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
