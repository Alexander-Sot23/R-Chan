import { getApiBaseUrl } from '../config.js';

//Servicio para manejar la autenticación de administradores
export const adminAuthService = {
  //Login de administrador
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('sendData', JSON.stringify({
      username: username,
      password: password
    }));

    const response = await fetch(`${getApiBaseUrl()}/api/login`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      //Guardar token y datos del usuario
      localStorage.setItem('adminToken', result.token);
      localStorage.setItem('adminUser', JSON.stringify({
        username: result.username,
        userId: result.userId,
        role: result.role,
        firstLogin: result.firstLogin,
        lastLogin: result.lastLogin
      }));

      return result;
    } else {
      throw new Error(result.error || 'Error de autenticación');
    }
  },

  //Logout de administrador
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  //Verificar si el administrador está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      return false;
    }

    try {
      const user = JSON.parse(userData);
      return !!user.username;
    } catch (error) {
      console.error('Error parsing admin user data:', error);
      return false;
    }
  },

  //Obtener datos del administrador actual
  getCurrentAdmin: () => {
    const userData = localStorage.getItem('adminUser');

    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing admin user data:', error);
      return null;
    }
  },

  //Obtener token JWT
  getToken: () => {
    return localStorage.getItem('adminToken');
  },

  //Verificar si el token ha expirado (implementación básica)
  isTokenExpired: () => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      return true;
    }

    try {
      //Decodificar el payload del JWT (sin verificar firma)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },

  //Crear headers con token para requests autenticados
  getAuthHeaders: () => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  },

  //Iniciar proceso de reset de contraseña
  forgotPassword: async (email) => {
    const response = await fetch(`${getApiBaseUrl()}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    //Manejar respuestas vacías o sin JSON
    let result;
    try {
      const responseText = await response.text();
      result = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      //Si no hay JSON válido, asumir éxito si el status es 200
      if (response.ok) {
        result = { success: true, message: 'Reset code sent to your email' };
      } else {
        throw new Error('Error al enviar email de reset');
      }
    }

    if (!response.ok) {
      throw new Error(result.error || 'Error al enviar email de reset');
    }

    return result;
  },

  //Verificar código de reset
  verifyResetCode: async (email, code) => {
    const response = await fetch(`${getApiBaseUrl()}/api/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code })
    });

    //Manejar respuestas vacías o sin JSON
    let result;
    try {
      const responseText = await response.text();
      result = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      //Si no hay JSON válido, asumir éxito si el status es 200
      if (response.ok) {
        result = { success: true, message: 'Code verified' };
      } else {
        throw new Error('Código inválido o expirado');
      }
    }

    if (!response.ok) {
      throw new Error(result.error || 'Código inválido o expirado');
    }

    return result;
  },

  //Resetear contraseña
  resetPassword: async (email, code, newPassword, confirmPassword) => {
    const response = await fetch(`${getApiBaseUrl()}/api/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code, newPassword, confirmPassword })
    });

    //Manejar respuestas vacías o sin JSON
    let result;
    try {
      const responseText = await response.text();
      result = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      //Si no hay JSON válido, asumir éxito si el status es 200
      if (response.ok) {
        result = { success: true, message: 'Password reset successfully' };
      } else {
        throw new Error('Error al resetear contraseña');
      }
    }

    if (!response.ok) {
      throw new Error(result.error || 'Error al resetear contraseña');
    }

    return result;
  }
};








