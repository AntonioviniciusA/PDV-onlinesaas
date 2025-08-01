/**
 * Verifica se o usuário tem permissão para executar uma ação em um módulo
 * @param {Object} user - Objeto do usuário atual
 * @param {string} permission - Permissão a ser verificada (ex: 'pdv.products', 'cash.manage', '*')
 * @returns {boolean} - True se o usuário tem permissão, false caso contrário
 */
export const hasPermission = (user, permission) => {
  // Se não há usuário, não tem permissão
  if (!user) {
    console.info("hasPermission: Usuário não encontrado");
    return false;
  }
  // Verifica se o usuário tem permissões definidas
  if (!user.permissions) {
    console.info("hasPermission: Usuário não tem permissões definidas");
    return false;
  }

  // Converte permissões para array se for string JSON
  let permissionsArray = [];

  if (typeof user.permissions === "string") {
    try {
      permissionsArray = JSON.parse(user.permissions);
    } catch (error) {
      console.error("Erro ao fazer parse das permissões:", error);
      return false;
    }
  } else if (Array.isArray(user.permissions)) {
    permissionsArray = user.permissions;
  } else {
    console.info(
      "hasPermission: Formato de permissões inválido:",
      typeof user.permissions
    );
    return false;
  }

  // Verifica se tem permissão específica ou permissão total (*)
  const hasPermission =
    permissionsArray.includes(permission) || permissionsArray.includes("*");

  return hasPermission;
};

/**
 * Retorna as permissões do usuário em formato legível
 * @param {Object} user - Objeto do usuário atual
 * @returns {Array} - Array com as permissões do usuário
 */
export const getUserPermissions = (user) => {
  if (!user || !user.permissions) return [];

  if (typeof user.permissions === "string") {
    try {
      return JSON.parse(user.permissions);
    } catch (error) {
      console.error("Erro ao fazer parse das permissões:", error);
      return [];
    }
  }

  return Array.isArray(user.permissions) ? user.permissions : [];
};
