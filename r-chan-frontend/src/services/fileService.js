import api from './api';

const getDynamicApiUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    
    if (hostname.match(/^192\.168\.|^10\.|^172\./)) {
      return `http://${hostname}:8080`;
    }
  }
  
  return import.meta.env.VITE_API_URL || 'http://localhost:8080';
};

const API_BASE_URL = getDynamicApiUrl();

export const fileService = {
  downloadFile: async (fileName) => {
    try {
      const response = await api.get(`/view-file?fileName=${encodeURIComponent(fileName)}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  getFileUrl: (fileName) => {
    return `${API_BASE_URL}/api/view-file?fileName=${encodeURIComponent(fileName)}`;
  },

  
  extractOriginalName: (fileName) => {
    if (!fileName || !fileName.includes('=')) return fileName;
    return fileName.substring(fileName.indexOf('=') + 1);
  },

  getFileType: (fileName) => {
    const originalName = fileService.extractOriginalName(fileName);
    const extension = originalName.toLowerCase().split('.').pop();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return 'video';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else {
      return 'other';
    }
  }
};