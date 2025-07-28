/**
 * Utilitários para manipulação de datas
 */

/**
 * Converte uma data para o timezone local (Brasil)
 * @param {string|Date} date - Data em UTC ou string ISO
 * @returns {string} Data formatada em ISO string no timezone local
 */
export const convertToLocalTimezone = (date) => {
  if (!date) return null;

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return null;
    }

    // Ajustar para timezone local (Brasil)
    const localDate = new Date(
      dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
    );
    return localDate.toISOString();
  } catch (error) {
    console.error("Erro ao converter timezone:", error);
    return null;
  }
};

/**
 * Formata uma data para exibição no formato brasileiro
 * @param {string|Date} date - Data para formatar
 * @returns {object} Objeto com date e time formatados
 */
export const formatDateTimeBR = (date) => {
  if (!date) {
    return { date: "N/A", time: "N/A" };
  }

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return { date: "Data inválida", time: "N/A" };
    }

    return {
      date: dateObj.toLocaleDateString("pt-BR"),
      time: dateObj.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch (error) {
    console.error("Erro ao formatar data:", error, date);
    return { date: "Erro", time: "N/A" };
  }
};

/**
 * Converte uma data para formato YYYY-MM-DD para comparação
 * @param {string|Date} date - Data para converter
 * @returns {string|null} Data no formato YYYY-MM-DD ou null se inválida
 */
export const toDateOnly = (date) => {
  if (!date) return null;

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return null;
    }

    return dateObj.toISOString().split("T")[0];
  } catch (error) {
    console.error("Erro ao converter data:", error);
    return null;
  }
};

/**
 * Verifica se duas datas são iguais (apenas data, ignorando hora)
 * @param {string|Date} date1 - Primeira data
 * @param {string|Date} date2 - Segunda data
 * @returns {boolean} true se as datas forem iguais
 */
export const isSameDate = (date1, date2) => {
  const dateOnly1 = toDateOnly(date1);
  const dateOnly2 = toDateOnly(date2);

  return dateOnly1 === dateOnly2;
};
