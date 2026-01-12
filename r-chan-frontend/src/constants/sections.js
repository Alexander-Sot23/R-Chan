/**
 * Representación del SectionEnum del backend
 * Mantener sincronizado con el enum Java
 */
export const SECTION_ENUM = {
  GENERAL: {
    id: 'GENERAL',
    displayName: 'General',
    description: 'Discusiones generales',
    color: '#6b7280' //gris
  },
  TECHNOLOGY: {
    id: 'TECHNOLOGY', 
    displayName: 'Tecnología',
    description: 'Tecnología e informática',
    color: '#3b82f6' //azul
  },
  SCIENCE: {
    id: 'SCIENCE',
    displayName: 'Ciencia', 
    description: 'Ciencias y descubrimientos',
    color: '#10b981' //verde
  },
  ARTS: {
    id: 'ARTS',
    displayName: 'Artes',
    description: 'Arte y cultura',
    color: '#8b5cf6' //violeta
  },
  SPORTS: {
    id: 'SPORTS',
    displayName: 'Deportes',
    description: 'Deportes y actividades físicas',
    color: '#ef4444' //rojo
  },
  ENTERTAINMENT: {
    id: 'ENTERTAINMENT',
    displayName: 'Entretenimiento',
    description: 'Cine, música y televisión',
    color: '#f59e0b' //ámbar
  },
  GAMING: {
    id: 'GAMING',
    displayName: 'Gaming',
    description: 'Videojuegos y e-sports',
    color: '#ec4899' //rosa
  },
  NEWS: {
    id: 'NEWS',
    displayName: 'Noticias',
    description: 'Noticias actuales',
    color: '#6366f1' //índigo
  }
};

/**
 * Convierte el enum a un array para usar en componentes
 */
export const SECTIONS_ARRAY = Object.values(SECTION_ENUM);

/**
 * Busca una sección por su ID (ej: 'GENERAL')
 */
export const getSectionById = (id) => {
  return SECTION_ENUM[id] || null;
};