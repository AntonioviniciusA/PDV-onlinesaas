import React from "react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "Como funciona o teste gratuito de 14 dias?",
      answer:
        "Nosso teste gratuito de 14 dias oferece acesso completo a todos os recursos do plano selecionado. Nenhum cartão de crédito é necessário para se cadastrar, e você pode cancelar a qualquer momento durante o período de teste sem compromisso.",
    },
    {
      question: "Posso alterar meu plano depois?",
      answer:
        "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Se você fizer upgrade, o novo preço será rateado pelo restante do seu ciclo de cobrança. Se fizer downgrade, o novo preço entrará em vigor no início do próximo ciclo de cobrança.",
    },
    {
      question: "Há limite para o número de usuários que posso adicionar?",
      answer:
        "O número de usuários depende do seu plano. O plano Básico permite até 5 membros da equipe, o plano Profissional permite até 20, e o plano Empresarial não tem limite de membros da equipe.",
    },
    {
      question:
        "Vocês oferecem desconto para organizações sem fins lucrativos ou instituições educacionais?",
      answer:
        "Sim, oferecemos preços especiais para organizações sem fins lucrativos, instituições educacionais e projetos de código aberto. Entre em contato com nossa equipe de vendas para mais informações.",
    },
    {
      question: "Quão seguros são meus dados?",
      answer:
        "Levamos a segurança muito a sério. Todos os dados são criptografados tanto em trânsito quanto em repouso. Usamos práticas de segurança padrão da indústria e passamos regularmente por auditorias de segurança. Nossa plataforma é compatível com GDPR, CCPA e outras regulamentações relevantes.",
    },
    {
      question: "Que tipo de suporte vocês oferecem?",
      answer:
        "O suporte varia conforme o plano. Todos os planos incluem suporte por email, com o plano Profissional oferecendo suporte prioritário por email. O plano Empresarial inclui suporte 24/7 por telefone e email. Também temos uma base de conhecimento extensa e fórum da comunidade disponível para todos os usuários.",
    },
  ];

  return (
    <section id="faq" className="w-full py-20 md:py-32">
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
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Encontre respostas para perguntas comuns sobre nossa plataforma.
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <AccordionItem
                  value={`item-${i}`}
                  className="border-b border-border/40 py-2"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
