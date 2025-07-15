import React, { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";
import { profileService } from "../../../services/profileService";

const ProfileTab = () => {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getClienteProfile();
        setProfile(data);
      } catch (error) {
        console.error("Erro ao carregar o perfil do cliente:", error.message);
        // opcional: mostrar erro na interface
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <div>Carregando...</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <User className="w-10 h-10 text-blue-500" />
        <div>
          <h2 className="text-xl font-bold">{profile.nome_representante}</h2>
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
            <MapPin className="w-4 h-4 mr-2" />
            Endereço: {profile.endereco}
          </div>
          <div className="flex items-center mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            Cidade: {profile.cidade}
          </div>
          <div className="flex items-center mb-2">Estado: {profile.estado}</div>
          <div className="flex items-center mb-2">CEP: {profile.cep}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-2">Razão Social: {profile.razao_social}</div>
          <div className="mb-2">CNPJ: {profile.cnpj}</div>
          <div className="mb-2">CPF: {profile.cpf}</div>
        </div>
      </div>
    </div>
  );
};
export default ProfileTab;
