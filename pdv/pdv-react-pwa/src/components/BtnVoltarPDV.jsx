import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BtnVoltarPDV() {
  const navigate = useNavigate();
  return (
    <Button variant="outline" size="sm" onClick={() => navigate("/pdv")}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Voltar
    </Button>
  );
}
