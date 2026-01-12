import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useTheme } from '../contexts/ThemeContext';
import { adminAuthService } from '../services/adminAuthService';
import { useSweetAlert } from '../utils/sweetAlert';
import { User, Mail, Shield, Calendar, Clock, Activity, ArrowLeft, HelpCircle, FileText, MessageSquare, Key, Trash2 } from 'lucide-react';
import { getApiBaseUrl } from '../config.js';
import { adminUserService } from '../services/adminUserService';
import PasswordInput from '../components/ui/PasswordInput';

const AdminProfilePage = () => {
  const { isDarkMode } = useTheme();
  const { showSuccess, showError } = useSweetAlert();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(null);

  //Estados para cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  //Estados para autoeliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const loadAdminStats = async (adminId) => {
    if (!adminId) {
      console.error('adminId is null or undefined');
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/admin/api/logs/stats/admin?id=${adminId}`, {
        method: 'GET',
        headers: adminAuthService.getAuthHeaders()
      });

      if (response.status === 401) {
        //JWT expirado - redirigir automáticamente al login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/administrator/login');
        return;
      }

      if (response.ok) {
        const stats = await response.json();
        setAdminStats(stats);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const loadGlobalStats = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/admin/api/logs/stats/global`, {
        method: 'GET',
        headers: adminAuthService.getAuthHeaders()
      });

      if (response.status === 401) {
        //JWT expirado - redirigir automáticamente al login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/administrator/login');
        return;
      }

      if (response.ok) {
        const globalStats = await response.json();
        //Actualizar las estadísticas globales si es necesario
      }
    } catch (error) {
      console.error('Error loading global stats:', error);
    }
  };

  const getTooltipContent = (type) => {
    const tooltips = {
      actions: {
        title: "Acciones de Moderación",
        description: "Número total de acciones realizadas por este administrador, incluyendo aprobaciones, rechazos, ediciones y eliminaciones de contenido."
      },
      posts: {
        title: "Posts Moderados",
        description: "Cantidad de publicaciones originales que este administrador ha revisado y moderado directamente."
      },
      reposts: {
        title: "Respuestas Moderadas",
        description: "Número de respuestas y republicaciones que este administrador ha gestionado en la plataforma."
      }
    };
    return tooltips[type];
  };

  const loadProfile = async () => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      navigate('/administrator/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      setAdminUser(user);

      //Obtener datos adicionales del perfil desde el backend
      //Determinar el endpoint basado en el rol del usuario
      const isAdmin = user.role?.toLowerCase() === 'admin';
      const profileEndpoint = isAdmin ? '/admin/api/profile' : '/moderator/api/profile';

      const response = await fetch(`${getApiBaseUrl()}${profileEndpoint}`, {
        method: 'GET',
        headers: adminAuthService.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);

        //Cargar estadísticas con el ID del perfil (del backend)
        if (user.role?.toLowerCase() === 'admin' && data.id) {
          await loadAdminStats(data.id);
        }
      } else if (response.status === 401) {
        //JWT expirado - redirigir automáticamente al login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/administrator/login');
        return;
      } else if (response.status === 403) {
        //Si no tiene permisos, usar los datos básicos del localStorage
        setProfileData(user);

        //Intentar cargar estadísticas con el ID del localStorage (fallback)
        if (user.role?.toLowerCase() === 'admin') {
          const adminId = user.id || user.userId;
          if (adminId) {
            await loadAdminStats(adminId);
          }
        }
      } else {
        throw new Error(`Error al cargar perfil: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showError('Error al cargar el perfil');
      //Usar datos básicos como fallback, pero mantener la estructura correcta
      const fallbackData = JSON.parse(userData);
      setProfileData({
        ...fallbackData,
        //Asegurar que username y role estén disponibles
        username: fallbackData.username || 'Usuario',
        role: fallbackData.role || 'USER'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //Cerrar tooltips cuando se hace click fuera
    const handleClickOutside = (event) => {
      if (!event.target.closest('.tooltip-container')) {
        setShowTooltip(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role) => {
    return role?.toLowerCase() === 'admin' ? 'Admin' : 'Mod';
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      showError('Las nuevas contraseñas no coinciden');
      return;
    }

    if (passwordFormData.currentPassword === passwordFormData.newPassword) {
      showError('La nueva contraseña no puede ser igual a la contraseña actual');
      return;
    }

    try {
      setChangingPassword(true);
      await adminUserService.changePassword(passwordFormData);

      //Limpiar formulario y cerrar modal
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setShowPasswordModal(false);

      showSuccess('Contraseña cambiada exitosamente');

    } catch (error) {
      console.error('Error changing password:', error);
      if (error.message?.includes('current password is incorrect')) {
        showError('La contraseña actual es incorrecta');
      } else {
        showError('Error al cambiar la contraseña');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!deletePassword.trim()) {
      showError('Debes ingresar tu contraseña para confirmar');
      return;
    }

    //Confirmación adicional
    const confirmResult = await new Promise((resolve) => {
      const confirmDelete = window.confirm(
        '¿Estás completamente seguro de que quieres eliminar tu cuenta?\n\nEsta acción es IRREVERSIBLE y perderás acceso permanente a:\n\n• Tu cuenta de administrador\n• Todos tus datos\n• Historial de moderación\n\n¿Continuar?'
      );
      resolve(confirmDelete);
    });

    if (!confirmResult) return;

    try {
      setDeletingAccount(true);

      //Crear el objeto de eliminación con el ID del usuario actual
      const deleteData = {
        id: profileData?.id || profileData?.userId,
        password: deletePassword
      };

      await adminUserService.deleteUser(deleteData);

      //Limpiar localStorage y redirigir
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      showSuccess('Cuenta eliminada exitosamente');

      //Limpiar estado del modal
      setShowDeleteModal(false);
      setDeletePassword('');

      //Redirigir después de un breve delay para que se vea el mensaje
      setTimeout(() => {
        navigate('/administrator/login');
      }, 1500);

    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.message?.includes('password') || error.message?.includes('contraseña')) {
        showError('Contraseña incorrecta. No se pudo eliminar la cuenta.');
      } else {
        showError('Error al eliminar la cuenta');
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-dark-bg-primary' : 'bg-light-bg-primary'
      }`}>
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
              isDarkMode ? 'border-dark-text-accent' : 'border-light-text-accent'
            }`}></div>
            <p className={`mt-4 ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
            }`}>
              Cargando perfil...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-dark-bg-primary' : 'bg-light-bg-primary'
    }`}>
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/administrator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isDarkMode
                ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-primary'
                : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary hover:bg-light-bg-primary'
            } border`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Mi Perfil
          </h1>
        </div>

        {/* Profile Info */}
        <div className={`rounded-lg p-6 mb-8 ${
          isDarkMode ? 'bg-dark-bg-secondary border border-dark-border-primary' : 'bg-light-bg-secondary border border-light-border-primary'
        }`}>
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 ${
              isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-light-bg-tertiary'
            }`}>
              {getRoleIcon(profileData?.role)}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className={`text-xl font-semibold mb-2 break-words overflow-hidden ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                {profileData?.username}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <Mail size={16} className={`flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      Correo electrónico
                    </p>
                    <p className={`font-medium break-all overflow-hidden ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      {profileData?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield size={16} className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      Rol
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
                      {profileData?.role?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={16} className={`flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      Fecha de registro
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
                      {formatDate(profileData?.createdDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className={`flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      Último login
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
                      {formatDate(profileData?.lastLogin)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        {profileData?.role?.toLowerCase() === 'admin' && (
          <div className={`rounded-lg p-6 ${
            isDarkMode
              ? 'bg-dark-bg-secondary border border-dark-border-primary'
              : 'bg-light-bg-secondary border border-light-border-primary'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
            }`}>
              Estadísticas Administrativas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={`rounded-lg p-4 text-center relative tooltip-container ${
                isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-light-bg-tertiary'
              }`}>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setShowTooltip(showTooltip === 'actions' ? null : 'actions')}
                    className={`p-1 rounded-full hover:bg-opacity-20 ${
                      isDarkMode ? 'hover:bg-dark-bg-secondary' : 'hover:bg-light-bg-secondary'
                    }`}
                  >
                    <HelpCircle size={14} className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'} />
                  </button>
                </div>
                <div className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  {adminStats?.totalActions || 0}
                </div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Acciones realizadas
                </p>

                {/* Tooltip */}
                {showTooltip === 'actions' && (
                  <div className={`absolute z-10 mt-2 p-3 rounded-lg shadow-lg border max-w-xs ${
                    isDarkMode
                      ? 'bg-dark-bg-secondary border-dark-border-primary text-dark-text-primary'
                      : 'bg-light-bg-secondary border-light-border-primary text-light-text-primary'
                  }`}>
                    <div className="flex items-start gap-2">
                      <Activity size={16} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className={`font-semibold text-sm mb-1 ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}>
                          {getTooltipContent('actions').title}
                        </p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                        }`}>
                          {getTooltipContent('actions').description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={`rounded-lg p-4 text-center relative tooltip-container ${
                isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-light-bg-tertiary'
              }`}>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setShowTooltip(showTooltip === 'posts' ? null : 'posts')}
                    className={`p-1 rounded-full hover:bg-opacity-20 ${
                      isDarkMode ? 'hover:bg-dark-bg-secondary' : 'hover:bg-light-bg-secondary'
                    }`}
                  >
                    <HelpCircle size={14} className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'} />
                  </button>
                </div>
                <div className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  {adminStats?.postsModerated || 0}
                </div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Posts moderados
                </p>

                {/* Tooltip */}
                {showTooltip === 'posts' && (
                  <div className={`absolute z-10 mt-2 p-3 rounded-lg shadow-lg border max-w-xs ${
                    isDarkMode
                      ? 'bg-dark-bg-secondary border-dark-border-primary text-dark-text-primary'
                      : 'bg-light-bg-secondary border-light-border-primary text-light-text-primary'
                  }`}>
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className={`font-semibold text-sm mb-1 ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}>
                          {getTooltipContent('posts').title}
                        </p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                        }`}>
                          {getTooltipContent('posts').description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={`rounded-lg p-4 text-center relative tooltip-container ${
                isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-light-bg-tertiary'
              }`}>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setShowTooltip(showTooltip === 'reposts' ? null : 'reposts')}
                    className={`p-1 rounded-full hover:bg-opacity-20 ${
                      isDarkMode ? 'hover:bg-dark-bg-secondary' : 'hover:bg-light-bg-secondary'
                    }`}
                  >
                    <HelpCircle size={14} className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'} />
                  </button>
                </div>
                <div className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  {adminStats?.repostsModerated || 0}
                </div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Respuestas moderadas
                </p>

                {/* Tooltip */}
                {showTooltip === 'reposts' && (
                  <div className={`absolute z-10 mt-2 p-3 rounded-lg shadow-lg border max-w-xs ${
                    isDarkMode
                      ? 'bg-dark-bg-secondary border-dark-border-primary text-dark-text-primary'
                      : 'bg-light-bg-secondary border-light-border-primary text-light-text-primary'
                  }`}>
                    <div className="flex items-start gap-2">
                      <MessageSquare size={16} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className={`font-semibold text-sm mb-1 ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}>
                          {getTooltipContent('reposts').title}
                        </p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                        }`}>
                          {getTooltipContent('reposts').description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sección de Acciones */}
        <div className={`rounded-lg p-6 mt-8 ${
          isDarkMode ? 'bg-dark-bg-secondary border border-dark-border-primary' : 'bg-light-bg-secondary border border-light-border-primary'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Acciones de Cuenta
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 sm:flex-initial"
            >
              <Key size={18} />
              Cambiar Contraseña
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex-1 sm:flex-initial"
            >
              <Trash2 size={18} />
              Eliminar Mi Cuenta
            </button>
          </div>

          <div className={`mt-4 p-4 rounded-lg ${
            isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${
              isDarkMode ? 'text-red-300' : 'text-red-700'
            }`}>
              <strong>Advertencia:</strong> La eliminación de cuenta es permanente e irreversible.
              Perderás acceso a todos tus datos y funciones administrativas.
            </p>
          </div>
        </div>

        {/* Modal Cambiar Contraseña */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg max-w-md w-full ${
              isDarkMode
                ? 'bg-dark-bg-secondary border border-dark-border-primary'
                : 'bg-light-bg-secondary border border-light-border-primary'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Cambiar Contraseña
                  </h3>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className={`p-2 rounded-lg ${
                      isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                    }`}
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                  }`}>
                    <Key size={20} className={`mb-2 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <p className={`text-sm ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Contraseña Actual
                    </label>
                    <PasswordInput
                      value={passwordFormData.currentPassword}
                      onChange={(e) => setPasswordFormData({...passwordFormData, currentPassword: e.target.value})}
                      placeholder="Contraseña actual"
                      isDarkMode={isDarkMode}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Nueva Contraseña
                    </label>
                    <PasswordInput
                      value={passwordFormData.newPassword}
                      onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})}
                      placeholder="Nueva contraseña"
                      isDarkMode={isDarkMode}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Confirmar Nueva Contraseña
                    </label>
                    <PasswordInput
                      value={passwordFormData.confirmNewPassword}
                      onChange={(e) => setPasswordFormData({...passwordFormData, confirmNewPassword: e.target.value})}
                      placeholder="Confirmar nueva contraseña"
                      isDarkMode={isDarkMode}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-tertiary'
                          : 'border-light-border-primary text-light-text-primary hover:bg-light-bg-tertiary'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Eliminar Cuenta */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg max-w-md w-full ${
              isDarkMode
                ? 'bg-dark-bg-secondary border border-dark-border-primary'
                : 'bg-light-bg-secondary border border-light-border-primary'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold flex items-center gap-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    <Trash2 size={20} className="text-red-500" />
                    Eliminar Mi Cuenta
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePassword('');
                    }}
                    className={`p-2 rounded-lg ${
                      isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                    }`}
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <div className={`p-4 rounded-lg mb-4 ${
                    isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-red-300' : 'text-red-700'
                    }`}>
                      Acción Irreversible
                    </h4>
                    <p className={`text-sm mb-3 ${
                      isDarkMode ? 'text-red-200' : 'text-red-600'
                    }`}>
                      Al eliminar tu cuenta perderás permanentemente:
                    </p>
                    <ul className={`text-sm list-disc list-inside space-y-1 ${
                      isDarkMode ? 'text-red-200' : 'text-red-600'
                    }`}>
                      <li>Acceso a tu cuenta de administrador</li>
                      <li>Todos tus datos personales</li>
                      <li>Historial de moderación</li>
                      <li>Estadísticas y logs administrativos</li>
                    </ul>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-yellow-200' : 'text-yellow-700'
                    }`}>
                      Esta acción NO se puede deshacer. Si estás seguro, ingresa tu contraseña para confirmar.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Confirma tu contraseña
                    </label>
                    <PasswordInput
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Ingresa tu contraseña actual"
                      isDarkMode={isDarkMode}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletePassword('');
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-tertiary'
                          : 'border-light-border-primary text-light-text-primary hover:bg-light-bg-tertiary'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={deletingAccount || !deletePassword.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingAccount ? 'Eliminando...' : 'Eliminar Cuenta'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfilePage;







