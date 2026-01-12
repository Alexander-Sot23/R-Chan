//Configuración de la API
//Función para obtener URL base dinámica - se ejecuta cada vez que se llama
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    //Si estamos en localhost, usar localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }

    //Si estamos en una IP de red local, usar esa IP
    if (hostname.match(/^192\.168\.|^10\.|^172\./)) {
      return `http://${hostname}:8080`;
    }

    //Para cualquier otra IP externa
    return `http://${hostname}:8080`;
  }

  //Fallback para SSR
  return 'http://localhost:8080';
};

//Exportar como función para mantener consistencia
export const API_BASE_URL = getApiBaseUrl();
