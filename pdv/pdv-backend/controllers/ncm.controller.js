const axios = require("axios");

let cacheNcm = null;
let cacheAt = 0;

// Função para baixar e atualizar cache NCM (24h)
async function atualizarCache() {
  const now = Date.now();
  if (!cacheNcm || now - cacheAt > 24 * 60 * 60 * 1000) {
    try {
      console.log("Atualizando cache NCM...");
      const resp = await axios.get(
        "https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json?perfil=PUBLICO"
      );
      cacheNcm = resp.data.Nomenclaturas.map((i) => ({
        codigo: i.Codigo,
        descricao: i.Descricao,
      }));
      cacheAt = now;
      console.log(`Cache NCM atualizado com ${cacheNcm.length} registros`);
    } catch (error) {
      console.error("Erro ao atualizar cache NCM:", error.message);
      throw error;
    }
  }
}

// Buscar NCM específico
const buscarNcm = async (req, res) => {
  try {
    await atualizarCache();
    const codigo = req.params.codigo;

    if (!codigo) {
      return res.status(400).json({
        ok: false,
        mensagem: "Código NCM é obrigatório",
      });
    }

    // Remover pontos e espaços do código para busca
    const codigoLimpo = codigo.replace(/[.\s]/g, "");

    // Validar se tem pelo menos 2 dígitos
    if (codigoLimpo.length < 2) {
      return res.status(400).json({
        ok: false,
        mensagem: "NCM deve ter pelo menos 2 dígitos",
      });
    }

    // Buscar NCM que começa com o código fornecido
    const match = cacheNcm.find((i) => {
      const codigoItem = i.codigo.replace(/[.\s]/g, "");
      return codigoItem.startsWith(codigoLimpo);
    });

    if (match) {
      // Aplicar regras para preencher automaticamente outros campos
      // Estas regras podem ser customizadas conforme necessidade do negócio
      res.json({
        ok: true,
        codigo: match.codigo,
        descricao: match.descricao,
        cst: "00", // CST padrão para produtos nacionais
        cest: "0000000", // CEST padrão
        cfop: "5102", // CFOP padrão para venda de mercadoria
        origem: "0", // Origem padrão (nacional)
        csosn: "102", // CSOSN padrão para Simples Nacional
        modalidade_bc_icms: "0", // Modalidade BC ICMS padrão
        aliquota_icms: "18.00", // Alíquota ICMS padrão
        aliquota_ipi: "0.00", // Alíquota IPI padrão
        aliquota_pis: "1.65", // Alíquota PIS padrão
        aliquota_cofins: "7.60", // Alíquota COFINS padrão
        cst_pis: "01", // CST PIS padrão
        cst_cofins: "01", // CST COFINS padrão
      });
    } else {
      res.json({
        ok: false,
        mensagem: "NCM não encontrado",
      });
    }
  } catch (error) {
    console.error("Erro ao buscar NCM:", error);
    res.status(500).json({
      ok: false,
      erro: "Erro interno do servidor",
      detalhes: error.message,
    });
  }
};

// Forçar atualização do cache
const atualizarCacheNcm = async (req, res) => {
  try {
    cacheNcm = null; // Força atualização
    await atualizarCache();
    res.json({
      ok: true,
      mensagem: "Cache NCM atualizado com sucesso",
      quantidade: cacheNcm.length,
    });
  } catch (error) {
    console.error("Erro ao forçar atualização do cache NCM:", error);
    res.status(500).json({
      ok: false,
      erro: "Erro ao atualizar cache",
      detalhes: error.message,
    });
  }
};

module.exports = {
  buscarNcm,
  atualizarCacheNcm,
};
