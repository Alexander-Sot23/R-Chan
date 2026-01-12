export const ROLE_VALUES = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR'
};

//Nombres amigables para mostrar en la UI
export const ROLE_DISPLAY_NAMES = {
  [ROLE_VALUES.ADMIN]: 'Administrador',
  [ROLE_VALUES.MODERATOR]: 'Moderador'
};

/**
 * Verifica si un usuario tiene rol de administrador
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} true si es admin
 */
export const isAdmin = (user) => {
  if (!user || !user.role) return false;

  const role = user.role.toString().toUpperCase();
  return role === ROLE_VALUES.ADMIN || role === 'ADMINISTRATOR';
};

/**
 * Verifica si un usuario tiene rol de moderador
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} true si es moderador
 */
export const isModerator = (user) => {
  if (!user || !user.role) return false;

  const role = user.role.toString().toUpperCase();
  return role === ROLE_VALUES.MODERATOR || role === 'MODERATOR';
};

/**
 * Obtiene el nombre amigable del rol para mostrar en la UI
 * @param {string} role - Valor del rol
 * @returns {string} Nombre amigable del rol
 */
export const getRoleDisplayName = (role) => {
  if (!role) return 'Desconocido';

  const roleUpper = role.toString().toUpperCase();
  return ROLE_DISPLAY_NAMES[roleUpper] || role;
};

/**
 * Obtiene el sufijo de la API basado en el rol del usuario
 * @param {Object} user - Objeto de usuario
 * @returns {string} 'admin' o 'moderator'
 */
export const getApiRoleSuffix = (user) => {
  return isAdmin(user) ? 'admin' : 'moderator';
};






