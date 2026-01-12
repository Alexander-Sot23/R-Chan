import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useTheme } from '../contexts/ThemeContext';
import { adminAuthService } from '../services/adminAuthService';
import { useSweetAlert } from '../utils/sweetAlert';
import { FileText, Search, Filter, ArrowLeft, Calendar, User, Shield, AlertTriangle, CheckCircle, XCircle, Trash2, Edit, Plus, Eye } from 'lucide-react';
import { getApiBaseUrl } from '../config.js';

const AdminLogsPage = () => {
  const { isDarkMode } = useTheme();
  const { showError } = useSweetAlert();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const token = localStorage.getItem('adminToken');
      const userData = localStorage.getItem('adminUser');

      if (!token || !userData) {
        navigate('/administrator/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (user.role?.toLowerCase() !== 'admin') {
          showError('No tienes permisos para acceder a esta sección');
          navigate('/administrator');
          return;
        }

        loadLogs();
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/administrator/login');
      }
    };

    checkAdminAccess();
  }, [navigate]);

  //Detectar si estamos en móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const loadLogs = async (page = 0, action = '') => {
    //Evitar llamadas simultáneas
    if (isLoadingMore && page === currentPage && action === selectedAction) {
      return;
    }

    try {
      setIsLoadingMore(true);
      if (page === 0) {
        setLoading(true);
      }

      let url = `${getApiBaseUrl()}/admin/api/logs?page=${page}&size=20&sort=createdAt&direction=DESC`;

      if (action) {
        url = `${getApiBaseUrl()}/admin/api/logs/action?action=${action}&page=${page}&size=20`;
      }

      const response = await fetch(url, {
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
        const data = await response.json();
        setLogs(data.content || []);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(page);
        setSelectedAction(action);
      } else {
        throw new Error('Error al cargar logs');
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      showError('Error al cargar los logs de moderación');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleActionFilter = (action) => {
    setSelectedAction(action);
    loadLogs(0, action);
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
    //Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLog(null);
    //Restaurar scroll del body
    document.body.style.overflow = 'unset';
  };

  const formatDetailsModal = (details) => {
    if (!details) return 'Sin detalles disponibles';

    try {
      return Object.entries(details).map(([key, value]) => (
        <div key={key} className="mb-2">
          <span className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
            {key}:
          </span>
          <span className={`ml-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
          </span>
        </div>
      ));
    } catch (error) {
      return 'Error al formatear detalles';
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      loadLogs(0, selectedAction);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'POST_CREATED': return <Plus size={16} className="text-green-500" />;
      case 'POST_UPDATED': return <Edit size={16} className="text-blue-500" />;
      case 'POST_DELETED': return <Trash2 size={16} className="text-red-500" />;
      case 'POST_APPROVED': return <CheckCircle size={16} className="text-green-500" />;
      case 'POST_REJECTED': return <XCircle size={16} className="text-red-500" />;
      case 'REPOST_CREATED': return <Plus size={16} className="text-green-500" />;
      case 'REPOST_DELETED': return <Trash2 size={16} className="text-red-500" />;
      case 'USER_CREATED': return <User size={16} className="text-green-500" />;
      case 'USER_DELETED': return <Trash2 size={16} className="text-red-500" />;
      default: return <FileText size={16} className="text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    if (action.includes('CREATED') || action.includes('APPROVED')) return 'text-green-600';
    if (action.includes('UPDATED')) return 'text-blue-600';
    if (action.includes('DELETED') || action.includes('REJECTED')) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDetails = (details) => {
    if (!details) return 'Sin detalles';

    try {
      //Si es un string, intentar parsearlo
      let parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;

      //Si tiene old/new, mostrar cambios
      if (parsedDetails.old && parsedDetails.new) {
        const changes = [];
        for (const key in parsedDetails.new) {
          if (parsedDetails.old[key] !== parsedDetails.new[key]) {
            changes.push(`${key}: ${parsedDetails.old[key] || 'null'} → ${parsedDetails.new[key] || 'null'}`);
          }
        }
        return changes.length > 0 ? changes.join(', ') : 'Sin cambios detectados';
      }

      //Si es un objeto plano, mostrar propiedades principales
      const mainProps = ['content', 'title', 'username', 'email', 'reason'];
      const relevantDetails = mainProps
        .filter(prop => parsedDetails[prop])
        .map(prop => `${prop}: ${parsedDetails[prop]}`)
        .slice(0, 2); // Limitar a 2 propiedades

      return relevantDetails.length > 0 ? relevantDetails.join(', ') : 'Detalles técnicos';
    } catch (error) {
      return 'Detalles técnicos';
    }
  };

  const actionOptions = [
    { value: '', label: 'Todas las acciones' },
    { value: 'POST_CREATED', label: 'Posts creados' },
    { value: 'POST_UPDATED', label: 'Posts actualizados' },
    { value: 'POST_DELETED', label: 'Posts eliminados' },
    { value: 'POST_APPROVED', label: 'Posts aprobados' },
    { value: 'POST_REJECTED', label: 'Posts rechazados' },
    { value: 'REPOST_CREATED', label: 'Respuestas creadas' },
    { value: 'REPOST_DELETED', label: 'Respuestas eliminadas' },
    { value: 'USER_CREATED', label: 'Usuarios creados' },
    { value: 'USER_DELETED', label: 'Usuarios eliminados' },
  ];

  if (loading && currentPage === 0) {
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
            <p className={`mt-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Cargando logs de moderación...
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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header con navegación */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/administrator')}
              className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition-all ${
                isDarkMode
                  ? 'bg-dark-bg-secondary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-tertiary'
                  : 'bg-light-bg-secondary border-light-border-primary text-light-text-primary hover:bg-light-bg-tertiary'
              } border`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Logs de Moderación
              </h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                Historial completo de acciones administrativas
              </p>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-lg ${
            isDarkMode ? 'bg-red-600/20' : 'bg-red-50'
          }`}>
            <p className={`text-sm font-medium flex items-center gap-2 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              <Shield size={16} />
Solo Admins
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className={`rounded-lg p-6 mb-6 ${
          isDarkMode
            ? 'bg-dark-bg-secondary border border-dark-border-primary'
            : 'bg-light-bg-secondary border border-light-border-primary'
        }`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`} />
                <input
                  id="search-logs"
                  name="searchLogs"
                  type="text"
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
            </div>

            {/* Filtro por acción */}
            <div className="md:w-64">
              <select
                id="filter-action"
                name="filterAction"
                value={selectedAction}
                onChange={(e) => handleActionFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary focus:border-blue-500 focus:ring-blue-500/20'
                    : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              >
                {actionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de logs */}
        <div className={`rounded-lg overflow-hidden ${
          isDarkMode
            ? 'bg-dark-bg-secondary border border-dark-border-primary'
            : 'bg-light-bg-secondary border border-light-border-primary'
        }`}>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
              <div className="text-center">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                  isDarkMode ? 'border-white' : 'border-black'
                }`}></div>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Cargando...
                </p>
              </div>
            </div>
          )}

          {logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className={`mx-auto mb-4 ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                No hay logs disponibles
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                {selectedAction ? 'No se encontraron logs para esta acción' : 'Aún no hay actividad registrada'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-light-bg-tertiary'
                  }`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        Acción
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        Administrador
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        Detalles
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-dark-border-primary' : 'divide-light-border-primary'
                  }`}>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className={`hover:${
                          isDarkMode ? 'bg-dark-bg-tertiary' : 'bg-light-bg-tertiary'
                        } transition-colors cursor-pointer`}
                        onClick={() => handleLogClick(log)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {getActionIcon(String(log.action))}
                            <span className={`text-sm font-medium ${getActionColor(String(log.action))}`}>
                              {String(log.action).replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User size={16} className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'} />
                            <span className={`text-sm ${
                              isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                            }`}>
                              {log.adminUsername || 'Sistema'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${
                            isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                          }`}>
                            {formatDetails(log.details)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'} />
                            <span className={`text-sm ${
                              isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                            }`}>
                              {formatDate(log.createdAt)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 px-4 pb-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`rounded-lg p-3 cursor-pointer active:scale-95 ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border border-dark-border-primary hover:bg-dark-bg-secondary'
                        : 'bg-light-bg-tertiary border border-light-border-primary hover:bg-light-bg-secondary'
                    } transition-all duration-200`}
                    onClick={() => handleLogClick(log)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getActionIcon(String(log.action))}
                        <span className={`text-sm font-medium truncate ${getActionColor(String(log.action))}`}>
                          {String(log.action).replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`text-xs flex-shrink-0 ml-2 ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        {formatDate(log.createdAt)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={14} className={`flex-shrink-0 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`} />
                        <span className={`text-sm truncate ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}>
                          {log.adminUsername || 'Sistema'}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText size={14} className={`flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`} />
                        <span className={`text-xs leading-relaxed break-words line-clamp-2 ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                        }`}>
                          {formatDetails(log.details)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              <button
                onClick={() => loadLogs(currentPage - 1, selectedAction)}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  currentPage === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-dark-bg-secondary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-tertiary'
                      : 'bg-light-bg-secondary border-light-border-primary text-light-text-primary hover:bg-light-bg-tertiary'
                }`}
              >
                Anterior
              </button>

              <span className={`px-4 py-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Página {currentPage + 1} de {totalPages}
              </span>

              <button
                onClick={() => loadLogs(currentPage + 1, selectedAction)}
                disabled={currentPage >= totalPages - 1}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  currentPage >= totalPages - 1
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-dark-bg-secondary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-tertiary'
                      : 'bg-light-bg-secondary border-light-border-primary text-light-text-primary hover:bg-light-bg-tertiary'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {showDetailsModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className={`rounded-lg w-full max-w-sm sm:max-w-md md:max-w-2xl mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[80vh] overflow-y-auto overflow-x-hidden ${
              isDarkMode ? 'bg-dark-bg-secondary border border-dark-border-primary' : 'bg-light-bg-secondary border border-light-border-primary'
            }`}>
              <div className={`p-4 sm:p-6 border-b ${
                isDarkMode ? 'border-dark-border-primary' : 'border-light-border-primary'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-base sm:text-lg font-semibold ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Detalles del Log
                  </h3>
                  <button
                    onClick={closeDetailsModal}
                    className={`p-2 rounded-lg hover:bg-opacity-80 ${
                      isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                    }`}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div>
                    <h4 className={`text-sm sm:text-base font-semibold mb-3 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Información General
                    </h4>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className={`text-sm font-medium min-w-fit ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                        }`}>
                          Acción:
                        </span>
                        <span className={`px-2 py-1 rounded text-xs sm:text-sm self-start ${
                          getActionColor(String(selectedLog.action))
                        }`}>
                          {String(selectedLog.action).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className={`text-sm font-medium min-w-fit ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                        }`}>
                          Administrador:
                        </span>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}>
                          {selectedLog.adminUsername || 'Sistema'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className={`text-sm font-medium min-w-fit ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                        }`}>
                          Fecha:
                        </span>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}>
                          {formatDate(selectedLog.createdAt)}
                        </span>
                      </div>
                      {selectedLog.postId && (
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                          }`}>
                            Post ID:
                          </span>
                          <span className={`font-mono text-xs break-all p-2 rounded border ${
                            isDarkMode
                              ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary'
                              : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary'
                          }`}>
                            {selectedLog.postId}
                          </span>
                        </div>
                      )}
                      {selectedLog.repostId && (
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                          }`}>
                            Repost ID:
                          </span>
                          <span className={`font-mono text-xs break-all p-2 rounded border ${
                            isDarkMode
                              ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary'
                              : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary'
                          }`}>
                            {selectedLog.repostId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-sm sm:text-base font-semibold mb-3 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Detalles de la Acción
                    </h4>
                    <div className={`p-3 rounded border text-xs sm:text-sm max-h-32 overflow-y-auto ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border-dark-border-primary'
                        : 'bg-light-bg-tertiary border-light-border-primary'
                    }`}>
                      <pre className="whitespace-pre-wrap break-words font-sans">
                        {formatDetailsModal(selectedLog.details)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 sm:p-6 border-t ${
                isDarkMode ? 'border-dark-border-primary' : 'border-light-border-primary'
              }`}>
                <div className="flex justify-end">
                  <button
                    onClick={closeDetailsModal}
                    className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary text-dark-text-primary hover:bg-dark-bg-secondary'
                        : 'bg-light-bg-tertiary text-light-text-primary hover:bg-light-bg-secondary'
                    } transition-colors`}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLogsPage;








