import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();

  const handleSubscribe = (plan, isYearly) => {
    navigate("/payment", {
      state: {
        plan: {
          ...plan,
          isYearly,
          price: isYearly
            ? plan.name === "Básico"
              ? 60
              : plan.name === "Profissional"
              ? 90
              : 150
            : plan.name === "Básico"
            ? 90
            : plan.name === "Profissional"
            ? 120
            : 199,
        },
      },
    });
  };

  const monthlyPlans = [
    {
      name: "Básico",
      price: "R$ 90",
      description: "Perfeito para pequenas empresas e startups.",
      features: [
        "Até 5 usuários",
        "Analytics básico",
        "5GB de armazenamento",
        "Suporte por email",
      ],
      cta: "Teste Grátis",
    },
    {
      name: "Profissional",
      price: "R$ 120",
      description: "Ideal para empresas em crescimento.",
      features: [
        "Até 20 usuários",
        "Analytics avançado",
        "25GB de armazenamento",
        "Suporte prioritário por email",
        "Acesso à API",
      ],
      cta: "Teste Grátis",
      popular: true,
    },
    {
      name: "Empresarial",
      price: "R$ 199",
      description: "Para grandes organizações com necessidades complexas.",
      features: [
        "Usuários ilimitados",
        "Analytics personalizado",
        "Armazenamento ilimitado",
        "Suporte 24/7 por telefone e email",
        "Acesso avançado à API",
        "Integrações personalizadas",
      ],
      cta: "Falar com Vendas",
    },
  ];

  const annuallyPlans = [
    {
      name: "Básico",
      price: "R$ 60",
      description: "Perfeito para pequenas empresas e startups.",
      features: [
        "Até 5 usuários",
        "Analytics básico",
        "5GB de armazenamento",
        "Suporte por email",
      ],
      cta: "Teste Grátis",
    },
    {
      name: "Profissional",
      price: "R$ 90",
      description: "Ideal para empresas em crescimento.",
      features: [
        "Até 20 usuários",
        "Analytics avançado",
        "25GB de armazenamento",
        "Suporte prioritário por email",
        "Acesso à API",
      ],
      cta: "Teste Grátis",
      popular: true,
    },
    {
      name: "Empresarial",
      price: "R$ 150",
      description: "Para grandes organizações com necessidades complexas.",
      features: [
        "Usuários ilimitados",
        "Analytics personalizado",
        "Armazenamento ilimitado",
        "Suporte 24/7 por telefone e email",
        "Acesso avançado à API",
        "Integrações personalizadas",
      ],
      cta: "Falar com Vendas",
    },
  ];

  return (
    <section
      id="pricing"
      className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

      <div className="container px-4 md:px-6 relative">
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
            Preços
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Preços Simples e Transparentes
          </h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Escolha o plano ideal para seu negócio. Todos os planos incluem um
            teste gratuito de 14 dias.
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <Tabs defaultValue="monthly" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="rounded-full p-1">
                <TabsTrigger value="monthly" className="rounded-full px-6">
                  Mensal
                </TabsTrigger>
                <TabsTrigger value="annually" className="rounded-full px-6">
                  Anual (Economize 20%)
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="monthly">
              <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                {monthlyPlans.map((plan, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card
                      className={`relative overflow-hidden h-full ${
                        plan.popular
                          ? "border-primary shadow-lg"
                          : "border-border/40 shadow-md"
                      } bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                          Mais Popular
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="flex items-baseline mt-4">
                          <span className="text-4xl font-bold">
                            {plan.price}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            /mês
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-2">
                          {plan.description}
                        </p>
                        <ul className="space-y-3 my-6 flex-grow">
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-center">
                              <Check className="mr-2 size-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full mt-auto rounded-full ${
                            plan.popular
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() => handleSubscribe(plan, false)}
                        >
                          {plan.cta}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="annually">
              <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                {annuallyPlans.map((plan, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card
                      className={`relative overflow-hidden h-full ${
                        plan.popular
                          ? "border-primary shadow-lg"
                          : "border-border/40 shadow-md"
                      } bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                          Mais Popular
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="flex items-baseline mt-4">
                          <span className="text-4xl font-bold">
                            {plan.price}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            /mês
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-2">
                          {plan.description}
                        </p>
                        <ul className="space-y-3 my-6 flex-grow">
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-center">
                              <Check className="mr-2 size-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full mt-auto rounded-full ${
                            plan.popular
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() => handleSubscribe(plan, true)}
                        >
                          {plan.cta}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
