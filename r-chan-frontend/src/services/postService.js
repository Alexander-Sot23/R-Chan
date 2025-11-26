import api from './api';

export const postService = {
  getAllPosts: () => api.get('/posts'),
  getPostById: (id) => api.get(`/posts/${id}`),
  
  createPost: (formData) => {
    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
};