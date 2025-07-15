import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useNavigate } from "react-router-dom";
import planosService from "../../services/plansServices.js";

export default function Pricing() {
  const navigate = useNavigate();

  // Query para buscar planos mensais com cache
  const {
    data: monthlyPlans = [],
    isLoading: isLoadingMonthly,
    error: errorMonthly,
  } = useQuery({
    queryKey: ["plano", "monthly"],
    queryFn: async () => await planosService.getMonthlyPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query para buscar planos anuais com cache
  const {
    data: annuallyPlans = [],
    isLoading: isLoadingAnnually,
    error: errorAnnually,
  } = useQuery({
    queryKey: ["plano", "annually"],
    queryFn: async () => await planosService.getAnnuallyPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });

  const handleSubscribe = (plan, isYearly) => {
    navigate("/payment", {
      state: {
        plan: {
          ...plan,
          isYearly,
          price: isYearly
            ? plan.nome === "Básico"
              ? 972
              : plan.nome === "Profissional"
              ? 1296
              : 1910
            : plan.nome === "Básico"
            ? 90
            : plan.nome === "Profissional"
            ? 120
            : 199,
        },
      },
    });
  };

  // Função para transformar dados do backend para o formato do frontend
  const transformPlanData = (plan) => ({
    name: plan.nome,
    price: plan.preco_exibicao,
    description: plan.descricao,
    features: plan.funcionalidades,
    cta: plan.texto_cta,
    popular: Boolean(plan.popular), // força booleano
  });

  const transformedMonthlyPlans = monthlyPlans.map(transformPlanData);
  const transformedAnnuallyPlans = annuallyPlans.map(transformPlanData);

  // Loading state
  if (isLoadingMonthly || isLoadingAnnually) {
    return (
      <section
        id="pricing"
        className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden"
      >
        <div className="container px-4 md:px-6 relative">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando planos...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (errorMonthly || errorAnnually) {
    return (
      <section
        id="pricing"
        className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden"
      >
        <div className="container px-4 md:px-6 relative">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive">Erro ao carregar os planos</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
                  Anual (Economize 10%)
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="monthly">
              <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                {transformedMonthlyPlans.map((plan, i) => (
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
                {transformedAnnuallyPlans.map((plan, i) => (
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
