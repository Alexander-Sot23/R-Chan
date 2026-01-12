import axios from 'axios';

//Función para obtener URL base dinámica
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

const apiClient = axios.create({
  baseURL: getDynamicBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

//Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      //El backend respondió con un error
      console.error('Error del servidor:', error.response.data);
      return Promise.reject({
        message: error.response.data.error || 'Error del servidor',
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      //La petición se hizo pero no hubo respuesta
      console.error('Sin respuesta del servidor:', error.request);
      return Promise.reject({
        message: 'No se pudo conectar con el servidor',
        status: 0,
      });
    } else {
      //Error al configurar la petición
      console.error('Error en la petición:', error.message);
      return Promise.reject({
        message: 'Error en la configuración de la petición',
        status: null,
      });
    }
  }
);

export default apiClient;