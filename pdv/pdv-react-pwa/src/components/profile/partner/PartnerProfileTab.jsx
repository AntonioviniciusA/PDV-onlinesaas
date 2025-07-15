import React, { useEffect, useState } from "react";
import {
  Building,
  Mail,
  Phone,
  Globe,
  Users,
  TrendingUp,
  Edit,
} from "lucide-react";
import { profileService } from "../../../services/profileService";

const PartnerProfileTab = () => {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    profileService.getParceiroProfile().then(setProfile);
  }, []);
  if (!profile) return <div>Carregando...</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Building className="w-10 h-10 text-blue-500" />
        <div>
          <h2 className="text-xl font-bold">{profile.nome}</h2>
          <p className="text-gray-600">{profile.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <Mail className="w-4 h-4 mr-2" />
            Email: {profile.email}
          </div>
          <div className="flex items-center mb-2">
            <Phone className="w-4 h-4 mr-2" />
            Telefone: {profile.telefone}
          </div>
          <div className="flex items-center mb-2">
            <Globe className="w-4 h-4 mr-2" />
            Afiliado: {profile.afiliado ? "Sim" : "Não"}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-2">CPF: {profile.cpf}</div>
          <div className="mb-2">Ativo: {profile.ativo ? "Sim" : "Não"}</div>
        </div>
      </div>
    </div>
  );
};
export default PartnerProfileTab;
