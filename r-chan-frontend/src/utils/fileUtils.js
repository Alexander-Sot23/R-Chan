import { getApiBaseUrl } from '../config.js';

//Genera la URL completa para acceder a un archivo subido
export const getFileUrl = (fileName) => {
  if (!fileName) return null;

  //Usar el endpoint del FileManagerController
  return `${getApiBaseUrl()}/api/view-file?fileName=${encodeURIComponent(fileName)}`;
};

//Determina si un archivo es una imagen basado en su extensión
export const isImageFile = (fileName) => {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(ext);
};

//Determina si un archivo es un video
export const isVideoFile = (fileName) => {
  if (!fileName) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg'];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return videoExtensions.includes(ext);
};