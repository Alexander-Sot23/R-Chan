import { getApiBaseUrl } from '../config.js';
import { adminAuthService } from './adminAuthService.js';

//Función helper para manejar errores de autenticación
const handleAuthError = async (response) => {
  if (response.status === 401) {
    let responseText;
    try {
      //Leer el body solo una vez como texto
      responseText = await response.text();

      //Intentar parsear como JSON si es posible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (jsonParseError) {
        responseData = { error: responseText };
      }

      //Solo hacer logout si el token está realmente expirado
      if (responseData.type === 'TOKEN_EXPIRED' ||
          responseData.error?.includes('expired') ||
          responseData.error?.includes('JWT token has expired') ||
          responseText.includes('TOKEN_EXPIRED') ||
          responseText.includes('expired') ||
          responseText.includes('JWT token has expired')) {
        adminAuthService.logout();
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }

      //Para otros errores 401, devolver el error sin hacer logout
      throw new Error(responseData.error || responseText || 'No autorizado');

    } catch (readError) {
      //Si no se puede leer la respuesta, asumir error de autenticación
      throw new Error('Error de autenticación');
    }
  }
  return response;
};

//Servicio para manejar las operaciones de usuarios administradores
export const adminUserService = {
  //Obtener lista de usuarios con paginación
  getUsers: async (page = 0, size = 10, sort = 'createdDate', direction = 'DESC') => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/admin/api/user?page=${page}&size=${size}&sort=${sort}&direction=${direction}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      const responseData = await response.json().catch(() => ({}));
      if (responseData.type === 'TOKEN_EXPIRED' || responseData.error?.includes('expired')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }
    }

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return await response.json();
  },

  //Obtener usuario por ID
  getUserById: async (id) => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/admin/api/user/id?id=${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      const responseData = await response.json().catch(() => ({}));
      if (responseData.type === 'TOKEN_EXPIRED' || responseData.error?.includes('expired')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }
    }

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    return await response.json();
  },

  //Obtener usuario por username
  getUserByUsername: async (username) => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/admin/api/user/username?username=${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      const responseData = await response.json().catch(() => ({}));
      if (responseData.type === 'TOKEN_EXPIRED' || responseData.error?.includes('expired')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }
    }

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    return await response.json();
  },

  //Obtener usuario por email
  getUserByEmail: async (email) => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/admin/api/user/email?email=${email}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      const responseData = await response.json().catch(() => ({}));
      if (responseData.type === 'TOKEN_EXPIRED' || responseData.error?.includes('expired')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }
    }

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    return await response.json();
  },

  //Registrar nuevo usuario moderador
  registerUser: async (userData) => {
    const formData = new FormData();
    formData.append('sendData', JSON.stringify(userData));

    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/admin/api/user/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.status === 401) {
      const responseData = await response.json().catch(() => ({}));
      if (responseData.type === 'TOKEN_EXPIRED' || responseData.error?.includes('expired')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al registrar usuario');
    }

    return result;
  },

  //Verificar email con código
  verifyEmail: async (verifyData) => {
    const formData = new FormData();
    formData.append('sendData', JSON.stringify(verifyData));

    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/admin/api/user/verify-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.status === 401) {
      const responseData = await response.json().catch(() => ({}));
      if (responseData.type === 'TOKEN_EXPIRED' || responseData.error?.includes('expired')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al verificar email');
    }

    return result;
  },

  //Reenviar código de verificación
  resendVerificationCode: async (resendData) => {
    const formData = new FormData();
    formData.append('sendData', JSON.stringify(resendData));

    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/admin/api/user/resend-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.status === 401) {
      const responseData = await response.json().catch(() => ({}));
      if (responseData.type === 'TOKEN_EXPIRED' || responseData.error?.includes('expired')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al reenviar código');
    }

    return result;
  },

  //Eliminar usuario
  deleteUser: async (deleteData) => {
    const formData = new FormData();
    formData.append('sendData', JSON.stringify(deleteData));

    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/admin/api/user`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.status === 401) {
      const responseData = await response.json().catch(() => ({}));
      if (responseData.type === 'TOKEN_EXPIRED' || responseData.error?.includes('expired')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }
    }

    if (!response.ok) {
      //Manejar errores de autorización (403) específicamente
      if (response.status === 403) {
        throw new Error('No tienes permisos para eliminar usuarios. Solo los administradores pueden realizar esta acción.');
      }

      //Manejar errores de restricción de integridad (500 con SQL error)
      if (response.status === 500) {
        try {
          const errorText = await response.text();
          if (errorText.includes('foreign key constraint') ||
              errorText.includes('SQLIntegrityConstraintViolationException') ||
              errorText.includes('Cannot delete or update a parent row')) {
            throw new Error('No se puede eliminar este usuario porque tiene datos relacionados. Contacta al administrador del sistema.');
          }
        } catch (parseError) {
          //Continuar con el manejo normal si no se puede parsear
        }
      }

      //Para otros errores, intentar parsear como JSON, pero manejar casos donde no lo sea
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        //Si no se puede parsear como JSON, usar el texto de la respuesta
        const errorText = await response.text().catch(() => 'Error desconocido');
        errorData = { error: errorText || 'Error al eliminar usuario' };
      }

      throw new Error(errorData.error || 'Error al eliminar usuario');
    }

    //También manejar el caso donde pueda retornar JSON
    try {
      const responseData = await response.json();
      return responseData || true;
    } catch (parseError) {
      //Si no hay JSON en la respuesta (body vacío), es éxito
      return true;
    }
  },

  //Obtener estadísticas globales de usuarios
  getUserStats: async () => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/admin/api/user/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      const responseData = await response.json().catch(() => ({}));
      if (responseData.type === 'TOKEN_EXPIRED' || responseData.error?.includes('expired')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/administrator/login';
        throw new Error('Sesión expirada');
      }
    }

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas de usuarios');
    }

    return await response.json();
  },

  //Cambiar rol de usuario
  updateUserRole: async (userId, newRole) => {
    const token = localStorage.getItem('adminToken');

    //Verificar si el token está expirado antes de hacer la request
    if (adminAuthService.isTokenExpired()) {
      adminAuthService.logout();
      window.location.href = '/administrator/login';
      throw new Error('Sesión expirada');
    }


    const response = await fetch(`${getApiBaseUrl()}/admin/api/user/${userId}/role?newRole=${newRole}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });


    //Manejar errores de autenticación automáticamente
    const validResponse = await handleAuthError(response);

    const result = await validResponse.json();

    if (!validResponse.ok) {
      throw new Error(result.error || 'Error al cambiar rol de usuario');
    }

    return result;
  },

  //Cambiar contraseña propia
  changePassword: async (changePasswordData) => {
    const formData = new FormData();
    formData.append('sendData', JSON.stringify(changePasswordData));

    const token = localStorage.getItem('adminToken');

    //Verificar si el token está expirado antes de hacer la request
    if (adminAuthService.isTokenExpired()) {
      adminAuthService.logout();
      window.location.href = '/administrator/login';
      throw new Error('Sesión expirada');
    }


    const response = await fetch(`${getApiBaseUrl()}/admin/api/user/me/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });


    //Manejar errores de autenticación automáticamente
    const validResponse = await handleAuthError(response);

    //Manejar respuestas vacías o sin JSON
    let result;
    try {
      const responseText = await validResponse.text();
      result = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      //Si no hay JSON válido, asumir éxito si el status es 200
      if (validResponse.ok) {
        result = { success: true, message: 'Password changed successfully' };
      } else {
        throw new Error('Error al cambiar contraseña');
      }
    }

    if (!validResponse.ok) {
      throw new Error(result.error || 'Error al cambiar contraseña');
    }

    return result;
  }
};
