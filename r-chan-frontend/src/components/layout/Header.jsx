import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAuthService } from '../../services/adminAuthService';
import { useSweetAlert } from '../../utils/sweetAlert';
import { Sun, Moon, Shield, LogOut, Menu } from 'lucide-react';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { showConfirm } = useSweetAlert();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  //Verificar si es un administrador autenticado
  const isAdmin = adminAuthService.isAuthenticated();
  const adminUser = adminAuthService.getCurrentAdmin();

  //Determinar si estamos en zona de administración basado en la ruta actual
  const isAdminRoute = location.pathname.startsWith('/administrator');

  //Determinar la ruta de redirección del logo
  const logoPath = isAdminRoute ? '/administrator' : '/';

  //Función para cerrar sesión
  const handleLogout = async () => {
    const result = await showConfirm({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres cerrar sesión?',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar'
    });

    if (result.isConfirmed) {
      adminAuthService.logout();
      navigate('/administrator/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b shadow-lg transition-colors duration-300">
      {/* Usar clases condicionales directamente */}
      <div className={`${isDarkMode 
        ? 'bg-dark-bg-secondary border-dark-border-primary' 
        : 'bg-light-bg-secondary border-light-border-primary'}`}>
        
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={logoPath} className="cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <h1 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  R-Chan
                </h1>
                {isAdmin && (
                  <Shield size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                )}
              </div>
              <p className={`text-sm ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                {isAdmin ? `Panel Admin - ${adminUser?.username}` : 'Foro anónimo'}
              </p>
            </Link>

            <div className="relative menu-container">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? 'bg-dark-bg-tertiary text-dark-text-primary border-dark-border-primary'
                    : 'bg-light-bg-tertiary text-light-text-primary border-light-border-primary'
                }`}
                aria-label="Menú de opciones"
              >
                <Menu size={20} />
                <span className="text-sm font-medium">Menú</span>
              </button>

              {isMenuOpen && (
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg z-50 ${
                  isDarkMode
                    ? 'bg-dark-bg-secondary border-dark-border-primary'
                    : 'bg-light-bg-secondary border-light-border-primary'
                }`}>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        isDarkMode
                          ? 'text-dark-text-primary hover:bg-dark-bg-tertiary'
                          : 'text-light-text-primary hover:bg-light-bg-tertiary'
                      }`}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun size={16} className="text-yellow-400" />
                          <span>Modo claro</span>
                        </>
                      ) : (
                        <>
                          <Moon size={16} className="text-blue-600" />
                          <span>Modo oscuro</span>
                        </>
                      )}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          isDarkMode
                            ? 'text-red-400 hover:bg-red-600/10'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <LogOut size={16} />
                        <span>Cerrar sesión</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;