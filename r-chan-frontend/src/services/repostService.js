import apiClient from './api';

export const repostService = {
  //Obtener reposts paginados
  getReposts: (page = 0, size = 10, sort = 'createdDate') => {
    return apiClient.get('/repost', {
      params: { page, size, sort }
    }).then(response => response.data);
  },

  //Obtener un repost específico por ID
  getRepostById: (id) => {
    return apiClient.get('/repost/id', {
      params: { id }
    }).then(response => response.data);
  },

  //Obtener reposts por postId
  getRepostsByPostId: (postId) => {
    return apiClient.get('/repost/post/id', {
      params: { id: postId }
    }).then(response => response.data);
  },

  //Crear un nuevo repost
  createRepost: (repostData, file = null) => {
    const formData = new FormData();
    
    formData.append('postData', JSON.stringify(repostData));
    
    if (file) {
      formData.append('file', file);
    }

    return apiClient.post('/repost', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data);
  }
};