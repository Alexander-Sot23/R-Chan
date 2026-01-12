import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, Users, FileText, AlertTriangle, Activity, User, Settings } from 'lucide-react';
import { getApiBaseUrl } from '../config.js';
import { isAdmin, getApiRoleSuffix, getRoleDisplayName } from '../utils/roleUtils';
import { adminUserService } from '../services/adminUserService';

const AdminDashboardPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingVerificationUsers: 0
  });

  useEffect(() => {
    //Verificar si hay un token válido
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      navigate('/administrator/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      setAdminUser(user);

      //Las estadísticas se cargarán cuando adminUser esté disponible
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/administrator/login');
    }
  }, [navigate]);

  //Efecto separado para cargar estadísticas cuando adminUser cambie
  useEffect(() => {
    if (adminUser) {
      loadDashboardStats();
      loadUserStats();
    }
  }, [adminUser]);

  const loadDashboardStats = async () => {
    try {
      //Primero obtener el perfil del usuario para tener el ID correcto
      const profileResponse = await fetch(`${getApiBaseUrl()}/${getApiRoleSuffix(adminUser)}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (profileResponse.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/administrator/login');
        return;
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();

        //Ahora cargar estadísticas usando el ID del perfil
        if (profileData.id && isAdmin(adminUser)) {
          const statsResponse = await fetch(`${getApiBaseUrl()}/admin/api/logs/stats/admin?id=${profileData.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
              'Content-Type': 'application/json'
            }
          });

          if (statsResponse.ok) {
            const adminStats = await statsResponse.json();
            setDashboardStats({
              totalLogs: adminStats.totalActions || 0,
              adminStats
            });
          }
        } else {
          //Para otros roles o si no hay ID, mostrar 0 por ahora
          setDashboardStats({
            totalLogs: 0,
            adminStats: null
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      //En caso de error, mostrar 0
      setDashboardStats({
        totalLogs: 0,
        adminStats: null
      });
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await adminUserService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      //En caso de error, mantener valores por defecto
    }
  };

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

      <main className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Welcome Section */}
        <div className={`rounded-lg p-6 mb-8 ${
          isDarkMode
            ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-dark-border-primary'
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-light-border-primary'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <Shield size={32} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Panel de Administración
              </h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                Bienvenido, {adminUser.username}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className={`flex items-center gap-2 ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
            }`}>
              <Users size={16} />
              <span>Rol: {getRoleDisplayName(adminUser.role)}</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/administrator/profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isDarkMode
                    ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-primary'
                    : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary hover:bg-light-bg-primary'
                } border`}
              >
                <User size={16} />
                Ver Perfil
              </button>

              {isAdmin(adminUser) && (
                <button
                  onClick={() => navigate('/administrator/logs')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isDarkMode
                      ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-primary'
                      : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary hover:bg-light-bg-primary'
                  } border`}
                >
                  <Activity size={16} />
                  Ver Logs
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

          {/* Profile Card */}
          <div
            onClick={() => navigate('/administrator/profile')}
            className={`rounded-lg p-6 transition-all hover:-translate-y-1 cursor-pointer ${
              isDarkMode
                ? 'bg-dark-bg-secondary border border-dark-border-primary hover:border-blue-500/50'
                : 'bg-light-bg-secondary border border-light-border-primary hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}>
                <User size={24} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  Mi Perfil
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  Ver información personal
                </p>
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
            }`}>
              {adminUser.username}
            </div>
          </div>

          {/* Users Stats - Solo para Admins */}
          {isAdmin(adminUser) && (
            <div
              onClick={() => navigate('/administrator/users')}
              className={`rounded-lg p-6 transition-all hover:-translate-y-1 cursor-pointer ${
                isDarkMode
                  ? 'bg-dark-bg-secondary border border-dark-border-primary hover:border-green-500/50'
                  : 'bg-light-bg-secondary border border-light-border-primary hover:border-green-500/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-green-600/20' : 'bg-green-100'
                }`}>
                  <Users size={24} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Usuarios
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Administrar cuentas
                  </p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                {userStats.totalUsers}
              </div>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                Total de usuarios registrados
              </p>
            </div>
          )}


          {/* Activity Stats - Solo para Admins */}
          {isAdmin(adminUser) && (
            <div
              onClick={() => navigate('/administrator/logs')}
              className={`rounded-lg p-6 transition-all hover:-translate-y-1 cursor-pointer ${
                isDarkMode
                  ? 'bg-dark-bg-secondary border border-dark-border-primary hover:border-purple-500/50'
                  : 'bg-light-bg-secondary border border-light-border-primary hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-purple-600/20' : 'bg-purple-100'
                }`}>
                  <Activity size={24} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Actividad Reciente
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Total de acciones realizadas
                  </p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                {dashboardStats?.totalLogs || 0}
              </div>
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                Acciones de moderación realizadas
              </p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className={`rounded-lg p-8 text-center ${
          isDarkMode
            ? 'bg-dark-bg-secondary border border-dark-border-primary'
            : 'bg-light-bg-secondary border border-light-border-primary'
        }`}>
          <FileText size={48} className={`mx-auto mb-4 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Gestión de Contenido
          </h2>
          <p className={`text-lg mb-6 ${
            isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
          }`}>
            Gestiona el contenido de la plataforma de forma eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/administrator/all-posts')}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              }`}
            >
              <FileText size={20} />
              Ver publicaciones
            </button>
            <button
              onClick={() => navigate('/administrator/all-posts?filter=PENDING')}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg ${
                isDarkMode
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
                  : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
              }`}
            >
              <AlertTriangle size={20} />
              Pendientes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
