import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "O Dominus PDV transformou como gerenciamos nossas vendas. Os recursos de automação nos economizaram inúmeras horas de trabalho manual.",
      author: "Sarah Johnson",
      role: "Gerente de Projetos, TechCorp",
      rating: 5,
    },
    {
      quote:
        "O painel de analytics fornece insights que nunca tínhamos acesso antes. Nos ajudou a tomar decisões baseadas em dados que melhoraram nosso ROI.",
      author: "Michael Chen",
      role: "Diretor de Marketing, GrowthLabs",
      rating: 5,
    },
    {
      quote:
        "O suporte ao cliente é excepcional. Sempre que tivemos um problema, a equipe foi rápida para responder e resolver. Não poderíamos pedir um serviço melhor.",
      author: "Emily Rodriguez",
      role: "Líder de Operações, StartupX",
      rating: 5,
    },
    {
      quote:
        "Tentamos várias soluções similares, mas nenhuma se compara à facilidade de uso e recursos abrangentes do Dominus PDV. Foi um divisor de águas.",
      author: "David Kim",
      role: "CEO, InnovateNow",
      rating: 5,
    },
    {
      quote:
        "As ferramentas de colaboração tornaram o trabalho remoto muito mais fácil para nossa equipe. Estamos mais produtivos do que nunca, apesar de estarmos espalhados por diferentes fusos horários.",
      author: "Lisa Patel",
      role: "Diretora de RH, RemoteFirst",
      rating: 5,
    },
    {
      quote:
        "A implementação foi perfeita e o ROI foi quase imediato. Reduzimos nossos custos operacionais em 30% desde que mudamos para o Dominus PDV.",
      author: "James Wilson",
      role: "COO, ScaleUp Inc",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="w-full py-20 md:py-32">
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
            Depoimentos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Amado por Equipes em Todo o Mundo
          </h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Não acredite apenas na nossa palavra. Veja o que nossos clientes têm
            a dizer sobre sua experiência.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex mb-4">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, j) => (
                        <Star
                          key={j}
                          className="size-4 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                  </div>
                  <p className="text-lg mb-6 flex-grow">{testimonial.quote}</p>
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
