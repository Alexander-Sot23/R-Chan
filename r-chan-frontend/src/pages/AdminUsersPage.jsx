import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useTheme } from '../contexts/ThemeContext';
import { adminUserService } from '../services/adminUserService';
import { adminAuthService } from '../services/adminAuthService';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  Shield,
  Mail,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { isAdmin, getRoleDisplayName, ROLE_VALUES, ROLE_DISPLAY_NAMES } from '../utils/roleUtils';
import { useSweetAlert } from '../utils/sweetAlert';
import PasswordInput from '../components/ui/PasswordInput';

const AdminUsersPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { execute, loading, error } = useApi();
  const { showSuccess, showError, showWarning } = useSweetAlert();

  //Estados principales
  const [adminUser, setAdminUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  //Estados para estadísticas globales
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingVerificationUsers: 0
  });

  //Estados para formularios
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  //Estados para formularios de creación
  const [createFormData, setCreateFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MODERATOR' // Valor por defecto
  });

  //Estados para verificación de email
  const [verificationData, setVerificationData] = useState({
    email: '',
    verificationCode: ''
  });

  //Estados para eliminación
  const [deleteFormData, setDeleteFormData] = useState({
    id: '',
    password: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  //Estados para cambio de rol
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [newRole, setNewRole] = useState('');

  //Estados para verificación desde tabla
  const [showTableVerifyModal, setShowTableVerifyModal] = useState(false);
  const [userToVerify, setUserToVerify] = useState(null);
  const [tableVerifyCode, setTableVerifyCode] = useState('');

  //Estados de carga y errores específicos
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    //Verificar autenticación y rol de admin
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      navigate('/administrator/login');
      return;
    }

    try {
      const user = JSON.parse(userData);

      //Verificar que sea admin
      if (!isAdmin(user)) {
        navigate('/administrator');
        return;
      }

      setAdminUser(user);
      loadUsers();
      loadUserStats();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/administrator/login');
    }
  }, [navigate]);

  const loadUsers = async (page = 0) => {
    try {
      setLoadingUsers(true);
      const result = await execute(adminUserService.getUsers, page, 10, 'createdDate', 'DESC');

      setUsers(result.content || []);
      setCurrentPage(result.number || 0);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
    } catch (error) {
      console.error('Error loading users:', error);
      //Error ya manejado por el hook useApi
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await execute(adminUserService.getUserStats);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      //Error ya manejado por el hook useApi
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormErrors({});

    //Validación básica del frontend
    if (createFormData.password !== createFormData.confirmPassword) {
      setFormErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      setCreatingUser(true);
      const result = await execute(adminUserService.registerUser, createFormData);

      //Usuario creado exitosamente, mostrar modal de verificación
      setPendingUser({
        id: result.userId,
        email: createFormData.email,
        username: createFormData.username
      });

      setVerificationData({
        email: createFormData.email,
        verificationCode: ''
      });

      setShowCreateForm(false);
      setShowVerificationModal(true);

      setCreateFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'MODERATOR'
      });

    } catch (error) {
      console.error('Error creating user:', error);
      //El error ya se maneja en el hook useApi
    } finally {
      setCreatingUser(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    try {
      setVerifyingEmail(true);
      await execute(adminUserService.verifyEmail, verificationData);

      //Verificación exitosa
      setShowVerificationModal(false);
      setPendingUser(null);
      setVerificationData({ email: '', verificationCode: '' });

      //Recargar lista de usuarios y estadísticas
      loadUsers(currentPage);
      loadUserStats();

      //Mostrar mensaje de éxito
      showSuccess('Usuario verificado exitosamente');

    } catch (error) {
      console.error('Error verifying email:', error);
      //El error ya se maneja en el hook useApi
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleDeleteUser = async (e) => {
    e.preventDefault();

    try {
      setDeletingUser(true);
      await execute(adminUserService.deleteUser, deleteFormData);

      //Usuario eliminado exitosamente
      setShowDeleteModal(false);
      setUserToDelete(null);
      setDeleteFormData({ id: '', password: '' });

      //Recargar lista de usuarios y estadísticas
      loadUsers(currentPage);
      loadUserStats();

      showSuccess('Usuario eliminado exitosamente');

    } catch (error) {
      console.error('Error deleting user:', error);
      //Mostrar error específico si es de contraseña incorrecta
      if (error.message?.includes('password') || error.message?.includes('contraseña')) {
        showError('Contraseña incorrecta. Inténtalo de nuevo.');
      } else {
        showError('Error al eliminar usuario');
      }
    } finally {
      setDeletingUser(false);
    }
  };

  const handleChangeUserRole = async (e) => {
    e.preventDefault();

    if (!userToChangeRole) return;

    try {
      setDeletingUser(true); // Reutilizar el estado de carga
      await execute(() => adminUserService.updateUserRole(userToChangeRole.id, newRole));

      //Rol cambiado exitosamente
      setShowRoleModal(false);
      setUserToChangeRole(null);
      setNewRole('');

      //Recargar lista de usuarios y estadísticas
      loadUsers(currentPage);
      loadUserStats();

      showSuccess('Rol de usuario actualizado exitosamente');

    } catch (error) {
      console.error('Error changing user role:', error);
      //Mostrar error específico si es de contraseña incorrecta
      if (error.message?.includes('password') || error.message?.includes('contraseña')) {
        showError('Contraseña incorrecta. Inténtalo de nuevo.');
      } else {
        showError('Error al cambiar rol de usuario');
      }
    } finally {
      setDeletingUser(false);
    }
  };

  const openRoleModal = (user) => {
    setUserToChangeRole(user);
    setNewRole(user.role === 'ADMIN' ? 'MODERATOR' : 'ADMIN');
    setShowRoleModal(true);
  };

  const handleResendVerification = async (user) => {
    try {
      const resendData = { email: user.email };
      await execute(adminUserService.resendVerificationCode, resendData);

      showSuccess(`Código de verificación reenviado a ${user.email}`);

    } catch (error) {
      console.error('Error resending verification:', error);
      showError('Error al reenviar el código de verificación');
    }
  };

  const handleTableVerifyEmail = async (e) => {
    e.preventDefault();

    if (!userToVerify) return;

    try {
      setVerifyingEmail(true);
      const verifyData = {
        email: userToVerify.email,
        verificationCode: tableVerifyCode
      };

      await execute(adminUserService.verifyEmail, verifyData);

      //Verificación exitosa
      setShowTableVerifyModal(false);
      setUserToVerify(null);
      setTableVerifyCode('');

      //Recargar lista de usuarios y estadísticas
      loadUsers(currentPage);
      loadUserStats();

      showSuccess('Usuario verificado exitosamente');

    } catch (error) {
      console.error('Error verifying email from table:', error);
      showError('Código de verificación inválido o expirado');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const openTableVerifyModal = (user) => {
    setUserToVerify(user);
    setTableVerifyCode('');
    setShowTableVerifyModal(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteFormData({ id: user.id, password: '' });
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!adminUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-dark-bg-primary' : 'bg-light-bg-primary'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
            isDarkMode ? 'border-dark-text-accent' : 'border-light-text-accent'
          }`}></div>
          <p className={`mt-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-dark-bg-primary' : 'bg-light-bg-primary'
    }`}>
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/administrator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isDarkMode
                  ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-primary'
                  : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary hover:bg-light-bg-primary'
              } border`}
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Gestión de Moderadores
              </h1>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                Administra los usuarios moderadores de la plataforma
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <UserPlus size={18} />
Nuevo
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-lg p-6 ${
            isDarkMode
              ? 'bg-dark-bg-secondary border border-dark-border-primary'
              : 'bg-light-bg-secondary border border-light-border-primary'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  Total Usuarios
                </h3>
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
            }`}>
              {userStats.totalUsers}
            </div>
          </div>

          <div className={`rounded-lg p-6 ${
            isDarkMode
              ? 'bg-dark-bg-secondary border border-dark-border-primary'
              : 'bg-light-bg-secondary border border-light-border-primary'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  Activos
                </h3>
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
            }`}>
              {userStats.activeUsers}
            </div>
          </div>

          <div className={`rounded-lg p-6 ${
            isDarkMode
              ? 'bg-dark-bg-secondary border border-dark-border-primary'
              : 'bg-light-bg-secondary border border-light-border-primary'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Mail size={24} className="text-yellow-600" />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  Pendientes de Verificación
                </h3>
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
            }`}>
              {userStats.pendingVerificationUsers}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className={`rounded-lg overflow-hidden ${
          isDarkMode
            ? 'bg-dark-bg-secondary border border-dark-border-primary'
            : 'bg-light-bg-secondary border border-light-border-primary'
        }`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
            }`}>
              Lista de Moderadores
            </h2>
          </div>

          {loadingUsers ? (
            <div className="p-8 text-center">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                isDarkMode ? 'border-dark-text-accent' : 'border-light-text-accent'
              }`}></div>
              <p className={`mt-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                Cargando usuarios...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={48} className={`mx-auto mb-4 ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`} />
              <p className={`text-lg ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                No hay moderadores registrados
              </p>
              <p className={`text-sm mt-2 ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                Crea el primer moderador usando el botón "Crear Moderador"
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-light-bg-tertiary'
                  }`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                      }`}>
                        Usuario
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                      }`}>
                        Email
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                      }`}>
                        Estado Cuenta
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                      }`}>
                        Email Verificado
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                      }`}>
                        Creado
                      </th>
                      <th className={`px-6 py-4 text-left text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                      }`}>
                        Último Login
                      </th>
                      <th className={`px-6 py-4 text-right text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                      }`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-dark-border-primary' : 'divide-light-border-primary'
                  }`}>
                    {users.map((user) => (
                      <tr key={user.id} className={`${
                        isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                      } transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-light-bg-tertiary'
                            }`}>
                              <Shield size={16} className={
                                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                              } />
                            </div>
                            <div>
                              <div className={`font-medium ${
                                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                              }`}>
                                {user.username}
                              </div>
                              <div className={`text-sm ${
                                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                              }`}>
                                {getRoleDisplayName(user.role)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}>
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.accountEnabled ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                            <span className={`text-sm ${
                              user.accountEnabled
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {user.accountEnabled ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.emailVerified ? (
                              <>
                                <CheckCircle size={16} className="text-green-500" />
                                <span className="text-sm text-green-600 dark:text-green-400">
                                  Verificado
                                </span>
                              </>
                            ) : (
                              <div className="flex gap-1">
                                <XCircle size={16} className="text-red-500 mt-0.5" />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openTableVerifyModal(user)}
                                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                    title="Verificar código"
                                  >
                                    Verificar
                                  </button>
                                  <button
                                    onClick={() => handleResendVerification(user)}
                                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                    title="Reenviar código de verificación"
                                  >
                                    Reenviar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                        }`}>
                          {formatDate(user.createdDate)}
                        </td>
                        <td className={`px-6 py-4 text-sm ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                        }`}>
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => openRoleModal(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Cambiar rol"
                            >
                              <Shield size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className={`text-sm ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Mostrando {users.length} de {totalElements} usuarios
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadUsers(currentPage - 1)}
                      disabled={currentPage === 0}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Anterior
                    </button>
                    <span className={`px-3 py-1 text-sm ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Página {currentPage + 1} de {totalPages}
                    </span>
                    <button
                      onClick={() => loadUsers(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === totalPages - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal Crear Usuario */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode
              ? 'bg-dark-bg-secondary border border-dark-border-primary'
              : 'bg-light-bg-secondary border border-light-border-primary'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  Crear Nuevo Moderador
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                  }`}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={createFormData.username}
                    onChange={(e) => setCreateFormData({...createFormData, username: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary'
                        : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary'
                        : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Contraseña
                  </label>
                  <PasswordInput
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                    placeholder="Contraseña"
                    isDarkMode={isDarkMode}
                    required
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Confirmar contraseña
                  </label>
                  <PasswordInput
                    value={createFormData.confirmPassword}
                    onChange={(e) => setCreateFormData({...createFormData, confirmPassword: e.target.value})}
                    placeholder="Confirmar contraseña"
                    isDarkMode={isDarkMode}
                    required
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Rol
                  </label>
                  <select
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData({...createFormData, role: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary'
                        : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value={ROLE_VALUES.MODERATOR}>
                      {ROLE_DISPLAY_NAMES[ROLE_VALUES.MODERATOR]}
                    </option>
                    <option value={ROLE_VALUES.ADMIN}>
                      {ROLE_DISPLAY_NAMES[ROLE_VALUES.ADMIN]}
                    </option>
                  </select>
                  {formErrors.role && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
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
                    disabled={creatingUser}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingUser ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Verificación Email */}
      {showVerificationModal && pendingUser && (
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
                  Verificar Correo Electrónico
                </h3>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                  }`}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <Mail size={20} className={`mb-2 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <p className={`text-sm ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Se ha enviado un código de verificación de 6 dígitos al correo:
                  </p>
                  <p className={`font-medium mt-1 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    {pendingUser.email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    value={verificationData.verificationCode}
                    onChange={(e) => setVerificationData({...verificationData, verificationCode: e.target.value})}
                    className={`w-full px-3 py-2 text-center text-2xl font-mono tracking-widest rounded-lg border ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary'
                        : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  {formErrors.verificationCode && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.verificationCode}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-tertiary'
                        : 'border-light-border-primary text-light-text-primary hover:bg-light-bg-tertiary'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResendVerification(pendingUser)}
                    disabled={verifyingEmail}
                    className={`px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'border-yellow-600 text-yellow-600 hover:bg-yellow-900/20'
                        : 'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Reenviar
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingEmail}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingEmail ? 'Verificando...' : 'Verificar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Usuario */}
      {showDeleteModal && userToDelete && (
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
                  <AlertTriangle size={20} className="text-red-500" />
                  Eliminar Moderador
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                  }`}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className={`p-4 rounded-lg mb-6 ${
                isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
              }`}>
                <p className={`text-sm ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  ¿Estás seguro de que quieres eliminar al moderador <strong>{userToDelete.username}</strong>?
                </p>
                <p className={`text-sm mt-2 text-red-600 dark:text-red-400`}>
                  Esta acción no se puede deshacer.
                </p>
              </div>

              <form onSubmit={handleDeleteUser} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Confirma tu contraseña
                  </label>
                  <PasswordInput
                    value={deleteFormData.password}
                    onChange={(e) => setDeleteFormData({...deleteFormData, password: e.target.value})}
                    placeholder="Confirma tu contraseña"
                    isDarkMode={isDarkMode}
                    required
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
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
                    disabled={deletingUser}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingUser ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Rol */}
      {showRoleModal && userToChangeRole && (
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
                  Cambiar Rol de Usuario
                </h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                  }`}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <Shield size={20} className={`mb-2 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <p className={`text-sm ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Cambiando rol de: <strong>{userToChangeRole.username}</strong>
                  </p>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Rol actual: {getRoleDisplayName(userToChangeRole.role)}
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangeUserRole} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Nuevo Rol
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary'
                        : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="MODERATOR">
                      {ROLE_DISPLAY_NAMES.MODERATOR}
                    </option>
                    <option value="ADMIN">
                      {ROLE_DISPLAY_NAMES.ADMIN}
                    </option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
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
                    disabled={deletingUser}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingUser ? 'Cambiando...' : 'Cambiar Rol'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Verificación desde Tabla */}
      {showTableVerifyModal && userToVerify && (
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
                  Verificar Email
                </h3>
                <button
                  onClick={() => setShowTableVerifyModal(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                  }`}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <Mail size={20} className={`mb-2 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <p className={`text-sm ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Ingresa el código de verificación enviado al email:
                  </p>
                  <p className={`font-medium mt-1 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    {userToVerify.email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleTableVerifyEmail} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    value={tableVerifyCode}
                    onChange={(e) => setTableVerifyCode(e.target.value)}
                    className={`w-full px-3 py-2 text-center text-2xl font-mono tracking-widest rounded-lg border ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary'
                        : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary'
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTableVerifyModal(false)}
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
                    disabled={verifyingEmail}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingEmail ? 'Verificando...' : 'Verificar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
