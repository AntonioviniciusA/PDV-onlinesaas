import { apiAuth } from "./conection";
export const etiquetaService = {
  async getConfig() {
    try {
      const res = await apiAuth.get(`/etiqueta/etiqueta-config`);
      return res.data.config;
    } catch (error) {
      console.error("Erro ao buscar configuração de etiqueta:", error);
      throw new Error("Não foi possível obter a configuração de etiqueta.");
    }
  },
  async saveConfig(config) {
    try {
      const res = await apiAuth.post(`/etiqueta/etiqueta-config`, config);
      return res.data;
    } catch (error) {
      console.error("Erro ao salvar configuração de etiqueta:", error);
      throw new Error("Não foi possível salvar a configuração de etiqueta.");
    }
  },
  async updateConfig(id, config) {
    try {
      const res = await apiAuth.put(`/etiqueta/etiqueta-config/${id}`, config);
      return res.data;
    } catch (error) {
      console.error("Erro ao atualizar configuração de etiqueta:", error);
      throw new Error("Não foi possível atualizar a configuração de etiqueta.");
    }
  },
  async listDefaultTemplates() {
    try {
      const res = await apiAuth.get(`/etiqueta/etiqueta-templates-default`);
      return res.data.templates;
    } catch (error) {
      console.error("Erro ao listar templates de etiqueta:", error);
      throw new Error("Não foi possível listar os templates de etiqueta.");
    }
  },
  async listEtiquetaTemplates() {
    try {
      const res = await apiAuth.get(`/etiqueta/etiqueta-templates`);
      return res.data.templates;
    } catch (error) {
      console.error("Erro ao listar templates de etiqueta:", error);
      throw new Error("Não foi possível listar os templates de etiqueta.");
    }
  },
};
