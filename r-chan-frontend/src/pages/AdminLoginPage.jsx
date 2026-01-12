import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTheme } from '../contexts/ThemeContext';
import { useSweetAlert } from '../utils/sweetAlert';
import { adminAuthService } from '../services/adminAuthService';
import { LogIn, Eye, EyeOff, Shield } from 'lucide-react';

const AdminLoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { isDarkMode } = useTheme();
  const { showSuccess, showError } = useSweetAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      await adminAuthService.login(data.username, data.password);
      showSuccess('Inicio de sesión exitoso');
      navigate('/administrator');
    } catch (error) {
      console.error('Error en login:', error);
      showError(error.message || 'Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-br from-dark-bg-primary via-dark-bg-secondary to-dark-bg-tertiary'
        : 'bg-gradient-to-br from-light-bg-primary via-light-bg-secondary to-light-bg-tertiary'
    }`}>
      <div className={`w-full max-w-md mx-4 transition-all duration-300 ${
        isDarkMode
          ? 'bg-dark-bg-secondary border-dark-border-primary'
          : 'bg-light-bg-secondary border-light-border-primary'
      } border rounded-2xl shadow-2xl overflow-hidden`}>

        {/* Header */}
        <div className={`px-8 pt-8 pb-6 text-center ${
          isDarkMode
            ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20'
            : 'bg-gradient-to-r from-blue-100/50 to-purple-100/50'
        }`}>
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${
              isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <Shield size={32} className="text-white" />
            </div>
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Panel de Administración
          </h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
          }`}>
            Acceso restringido para moderadores
          </p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Username */}
            <div>
              <label className={`block font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Usuario o Email *
              </label>
              <input
                type="text"
                {...register('username', {
                  required: 'El usuario es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'Mínimo 3 caracteres'
                  }
                })}
                placeholder="Ingresa tu usuario o email"
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 border transition-all ${
                  isDarkMode
                    ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary focus:border-blue-500 focus:ring-blue-500/20'
                    : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className={`block font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: {
                      value: 6,
                      message: 'Mínimo 6 caracteres'
                    }
                  })}
                  placeholder="Ingresa tu contraseña"
                  className={`w-full px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 border transition-all ${
                    isDarkMode
                      ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isDarkMode ? 'text-dark-text-secondary hover:text-dark-text-primary' : 'text-light-text-secondary hover:text-light-text-primary'
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-t-transparent w-5 h-5 border-white"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className={`text-sm transition-colors ${
                isDarkMode
                  ? 'text-dark-text-secondary hover:text-blue-400'
                  : 'text-light-text-secondary hover:text-blue-600'
              }`}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Footer */}
          <div className={`text-center mt-6 pt-6 border-t ${
            isDarkMode ? 'border-dark-border-primary' : 'border-light-border-primary'
          }`}>
            <p className={`text-sm ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
            }`}>
              Acceso restringido solo para personal autorizado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
