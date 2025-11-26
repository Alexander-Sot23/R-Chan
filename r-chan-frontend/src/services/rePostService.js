import api from './api';

export const rePostService = {
  getAllRePosts: () => api.get('/reposts'),
  getRePostById: (id) => api.get(`/reposts/${id}`),
  getRePostsByPostId: (postId) => api.get(`/reposts/post/${postId}`),
  
  createRePost: (idOriginalPost, formData) => {
    return api.post(`/reposts/${idOriginalPost}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  updateRePost: (id, rePostData) => api.put(`/reposts/${id}`, rePostData),
  deleteRePost: (id) => api.delete(`/reposts/${id}`)
};