import apiClient from './api';

export const postService = {
  //Obtener posts paginados
  getPosts: (page = 0, size = 10, sort = 'createdDate', sectionType = null) => {
    const params = { page, size, sort };
    if (sectionType) {
      params.sectionType = sectionType;
    }
    return apiClient.get('/post', {
      params
    }).then(response => response.data);
  },

  //Obtener un post específico por ID
  getPostById: (id) => {
    return apiClient.get('/post/id', {
      params: { id }
    }).then(response => response.data);
  },

  //postService.js - método createPost
  createPost: (postData, file = null) => {
    const formData = new FormData();
    
    //postData debe incluir: { title, content, sectionType }
    formData.append('postData', JSON.stringify(postData));
    
    if (file) {
      formData.append('file', file);
    }

    return apiClient.post('/post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data);
  }
};