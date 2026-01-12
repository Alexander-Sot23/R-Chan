import { getApiBaseUrl } from '../config.js';

/**
 * Servicio para consumir la API de posts desde el panel de moderador
 */
export const moderatorPostService = {
  //Obtener lista de posts con paginación
  getPosts: async (page = 0, size = 10, sort = 'createdDate', direction = 'DESC') => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/post?page=${page}&size=${size}&sort=${sort}&direction=${direction}`, {
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
      throw new Error('Error al obtener posts');
    }

    return await response.json();
  },

  //Obtener post por ID
  getPostById: async (id) => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/post/id?id=${id}`, {
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
      throw new Error('Error al obtener post');
    }

    return await response.json();
  },

  //Crear nuevo post
  createPost: async (postData, file = null) => {
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('postData', JSON.stringify(postData));

    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/post`, {
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
      throw new Error(result.error || 'Error al crear post');
    }

    return result;
  },

  //Actualizar post
  updatePost: async (id, postData, file = null) => {
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('postData', JSON.stringify(postData));

    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/post?id=${id}`, {
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
      throw new Error(result.error || 'Error al actualizar post');
    }

    return result;
  },

  //Eliminar post
  deletePost: async (id) => {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(`${getApiBaseUrl()}/moderator/api/post?id=${id}`, {
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
      throw new Error(errorData.error || 'Error al eliminar post');
    }

    return true;
  }
};




