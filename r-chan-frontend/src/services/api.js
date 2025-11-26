import axios from 'axios';

const getDynamicBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
    
    if (hostname.match(/^192\.168\.|^10\.|^172\./)) {
      return `http://${hostname}:8080/api`;
    }
  }
  
  return (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
};

const api = axios.create({
  baseURL: getDynamicBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;