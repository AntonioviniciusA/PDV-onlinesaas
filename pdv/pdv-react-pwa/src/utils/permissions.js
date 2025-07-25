/**
 * Verifica se o usuário tem permissão para executar uma ação em um módulo
 * @param {Object} user - Objeto do usuário atual
 * @param {string} module - Nome do módulo (ex: 'pdv', 'products', 'reports')
 * @param {string} action - Ação a ser executada (ex: 'operate', 'authorize', 'manage')
 * @returns {boolean} - True se o usuário tem permissão, false caso contrário
 */
export const hasPermission = (user, module, action) => {
  // Se não há usuário, não tem permissão
  if (!user) {
    console.log("hasPermission: Usuário não encontrado");
    return false;
  }
  // Verifica se o usuário tem permissões definidas
  if (!user.permissions) {
    console.log("hasPermission: Usuário não tem permissões definidas");
    return false;
  }

  // Converte permissões para array se for string JSON
  let permissionsArray = [];

  if (typeof user.permissions === "string") {
    try {
      permissionsArray = JSON.parse(user.permissions);
      console.log(
        "hasPermission: Permissões convertidas de string JSON:",
        permissionsArray
      );
    } catch (error) {
      console.error("Erro ao fazer parse das permissões:", error);
      return false;
    }
  } else if (Array.isArray(user.permissions)) {
    permissionsArray = user.permissions;
    console.log("hasPermission: Permissões já são array:", permissionsArray);
  } else {
    console.log(
      "hasPermission: Formato de permissões inválido:",
      typeof user.permissions
    );
    return false;
  }

  const requiredPermission = `${module}.${action}`;
  const hasPermission =
    permissionsArray.includes(requiredPermission) ||
    permissionsArray.includes("*");

  console.log(
    `hasPermission: Verificando ${requiredPermission} em [${permissionsArray.join(
      ", "
    )}] = ${hasPermission}`
  );

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
