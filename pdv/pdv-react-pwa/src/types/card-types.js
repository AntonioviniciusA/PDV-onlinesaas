import { CreditCard, Utensils, Gift, Building } from "lucide-react";

const cardTypes = [
  {
    id: "credito",
    name: "Crédito",
    icon: CreditCard,
    color: "text-blue-600",
  },
  { id: "debito", name: "Débito", icon: CreditCard, color: "text-green-600" },
  {
    id: "alimentacao",
    name: "Alimentação",
    icon: Utensils,
    color: "text-orange-600",
  },
  { id: "refeicao", name: "Refeição", icon: Utensils, color: "text-red-600" },
  {
    id: "vale-presente",
    name: "Vale Presente",
    icon: Gift,
    color: "text-purple-600",
  },
  {
    id: "corporativo",
    name: "Corporativo",
    icon: Building,
    color: "text-gray-600",
  },
];

export default cardTypes;
