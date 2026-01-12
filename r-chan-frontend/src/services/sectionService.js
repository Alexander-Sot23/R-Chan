import apiClient from './api';

export const sectionService = {
  //Obtener todas las secciones paginadas
  getSections: (page = 0, size = 10, sort = 'postCount') => {
    return apiClient.get('/section', {
      params: { page, size, sort }
    }).then(response => response.data);
  },

  //Obtener una sección específica por ID
  getSectionById: (id) => {
    return apiClient.get('/section/id', {
      params: { id }
    }).then(response => response.data);
  }
};