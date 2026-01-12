import Swal from 'sweetalert2';
import { useTheme } from '../contexts/ThemeContext';

//Función para obtener la configuración base según el tema
const getThemeConfig = (isDarkMode) => ({
  background: isDarkMode ? '#1e293b' : '#ffffff',
  color: isDarkMode ? '#f1f5f9' : '#1e293b',
  confirmButtonColor: isDarkMode ? '#3b82f6' : '#2563eb',
  cancelButtonColor: isDarkMode ? '#64748b' : '#94a3b8',
  customClass: {
    popup: isDarkMode ? 'swal2-dark-popup' : 'swal2-light-popup',
    title: isDarkMode ? 'swal2-dark-title' : 'swal2-light-title',
    htmlContainer: isDarkMode ? 'swal2-dark-text' : 'swal2-light-text',
    confirmButton: isDarkMode ? 'swal2-dark-confirm' : 'swal2-light-confirm',
    cancelButton: isDarkMode ? 'swal2-dark-cancel' : 'swal2-light-cancel',
  }
});

//Función para mostrar alertas de éxito
export const showSuccessAlert = (message, isDarkMode = false) => {
  return Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: message,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    ...getThemeConfig(isDarkMode)
  });
};

//Función para mostrar alertas de error
export const showErrorAlert = (message, isDarkMode = false) => {
  return Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    ...getThemeConfig(isDarkMode)
  });
};

//Función para mostrar alertas de advertencia
export const showWarningAlert = (message, isDarkMode = false) => {
  return Swal.fire({
    icon: 'warning',
    title: 'Advertencia',
    text: message,
    ...getThemeConfig(isDarkMode)
  });
};

//Función para mostrar alertas de información
export const showInfoAlert = (message, isDarkMode = false) => {
  return Swal.fire({
    icon: 'info',
    title: 'Información',
    text: message,
    ...getThemeConfig(isDarkMode)
  });
};

//Función para mostrar alertas de confirmación
export const showConfirmAlert = (options, isDarkMode = false) => {
  const {
    title = '¿Estás seguro?',
    text = 'Esta acción no se puede deshacer',
    confirmText = 'Sí, continuar',
    cancelText = 'Cancelar',
    type = 'question'
  } = options;

  return Swal.fire({
    icon: type,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    ...getThemeConfig(isDarkMode)
  });
};

//Hook personalizado para usar SweetAlert con el tema actual
export const useSweetAlert = () => {
  const { isDarkMode } = useTheme();

  return {
    showSuccess: (message) => showSuccessAlert(message, isDarkMode),
    showError: (message) => showErrorAlert(message, isDarkMode),
    showWarning: (message) => showWarningAlert(message, isDarkMode),
    showInfo: (message) => showInfoAlert(message, isDarkMode),
    showConfirm: (options) => showConfirmAlert(options, isDarkMode)
  };
};

