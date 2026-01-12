import { getApiBaseUrl } from '../config.js';

/**
 * Servicio para consumir la API de reposts desde el panel de moderador
 */
export const moderatorRePostService = {
  //Obtener lista de reposts con paginación
  getReposts: async (page = 0, size = 10, sort = 'createdDate', direction = 'DESC') => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/repost?page=${page}&size=${size}&sort=${sort}&direction=${direction}`, {
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
      throw new Error('Error al obtener reposts');
    }

    return await response.json();
  },

  //Obtener repost por ID
  getRepostById: async (id) => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/repost/id?id=${id}`, {
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
      throw new Error('Error al obtener repost');
    }

    return await response.json();
  },

  //Crear nuevo repost
  createRepost: async (repostData, file = null) => {
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('postData', JSON.stringify(repostData));

    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/repost`, {
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
      throw new Error(result.error || 'Error al crear repost');
    }

    return result;
  },

  //Actualizar repost
  updateRepost: async (id, repostData, file = null) => {
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('postData', JSON.stringify(repostData));

    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/repost?id=${id}`, {
      method: 'PUT',
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
      throw new Error(result.error || 'Error al actualizar repost');
    }

    return result;
  },

  //Obtener reposts por postId
  getRepostsByPostId: async (postId, page = 0, size = 50, sort = 'createdDate') => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/repost/post/${postId}?page=${page}&size=${size}&sort=${sort}&direction=DESC`, {
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
      throw new Error('Error al obtener respuestas del post');
    }

    return await response.json();
  },

  //Eliminar repost
  deleteRepost: async (id) => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/repost?id=${id}`, {
      method: 'DELETE',
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al eliminar repost');
    }

    return true;
  }
};




