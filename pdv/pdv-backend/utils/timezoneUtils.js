/**
 * Utilitários para manipulação de timezone
 */

/**
 * Converte uma data UTC para o timezone especificado
 * @param {Date|string} utcDate - Data em UTC
 * @param {string} timezone - Timezone de destino (ex: 'America/Sao_Paulo')
 * @returns {string} Data formatada no timezone especificado
 */
const convertUTCToTimezone = (utcDate, timezone = "America/Sao_Paulo") => {
  if (!utcDate) return null;

  try {
    const date = new Date(utcDate);

    if (isNaN(date.getTime())) {
      return null;
    }

    // Converter para o timezone especificado
    const options = {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    return date.toLocaleString("pt-BR", options);
  } catch (error) {
    console.error("Erro ao converter timezone:", error);
    return null;
  }
};

/**
 * Converte uma data do timezone local para UTC
 * @param {Date|string} localDate - Data no timezone local
 * @param {string} timezone - Timezone de origem (ex: 'America/Sao_Paulo')
 * @returns {string} Data em UTC (ISO string)
 */
const convertLocalToUTC = (localDate, timezone = "America/Sao_Paulo") => {
  if (!localDate) return null;

  try {
    const date = new Date(localDate);

    if (isNaN(date.getTime())) {
      return null;
    }

    // Criar uma data no timezone especificado e converter para UTC
    const utcDate = new Date(
      date.toLocaleString("en-US", { timeZone: timezone })
    );
    return utcDate.toISOString();
  } catch (error) {
    console.error("Erro ao converter para UTC:", error);
    return null;
  }
};

/**
 * Formata uma data UTC para exibição no timezone especificado
 * @param {Date|string} utcDate - Data em UTC
 * @param {string} timezone - Timezone de destino
 * @returns {object} Objeto com date e time formatados
 */
const formatDateTimeInTimezone = (utcDate, timezone = "America/Sao_Paulo") => {
  if (!utcDate) {
    return { date: "N/A", time: "N/A" };
  }

  try {
    const date = new Date(utcDate);

    if (isNaN(date.getTime())) {
      return { date: "Data inválida", time: "N/A" };
    }

    const dateOptions = {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    const timeOptions = {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    return {
      date: date.toLocaleDateString("pt-BR", dateOptions),
      time: date.toLocaleTimeString("pt-BR", timeOptions),
    };
  } catch (error) {
    console.error("Erro ao formatar data no timezone:", error);
    return { date: "Erro", time: "N/A" };
  }
};

/**
 * Obtém a data atual em UTC
 * @returns {string} Data atual em UTC (ISO string)
 */
const getCurrentUTC = () => {
  return new Date().toISOString();
};

/**
 * Obtém apenas a data (sem hora) em UTC
 * @returns {string} Data atual em UTC (YYYY-MM-DD)
 */
const getCurrentUTCDate = () => {
  return new Date().toISOString().split("T")[0];
};

module.exports = {
  convertUTCToTimezone,
  convertLocalToUTC,
  formatDateTimeInTimezone,
  getCurrentUTC,
  getCurrentUTCDate,
};
