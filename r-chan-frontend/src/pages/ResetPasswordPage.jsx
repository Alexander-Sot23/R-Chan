import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTheme } from '../contexts/ThemeContext';
import { useSweetAlert } from '../utils/sweetAlert';
import { adminAuthService } from '../services/adminAuthService';
import { Lock, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { isDarkMode } = useTheme();
  const { showSuccess, showError } = useSweetAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const code = location.state?.code || '';

  useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      await adminAuthService.resetPassword(email, code, data.newPassword, data.confirmPassword);
      showSuccess('Contraseña restablecida exitosamente');
      //Redirigir al login
      navigate('/administrator/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      showError(error.message || 'Error al restablecer la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const newPassword = watch('newPassword');

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
            ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20'
            : 'bg-gradient-to-r from-purple-100/50 to-pink-100/50'
        }`}>
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${
              isDarkMode ? 'bg-purple-600/20' : 'bg-purple-100'
            }`}>
              <Lock size={32} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
            </div>
          </div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Nueva Contraseña
          </h1>
          <p className={`text-sm mt-2 ${
            isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
          }`}>
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* New Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('newPassword', {
                    required: 'La contraseña es obligatoria',
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Debe contener mayúsculas, minúsculas y números'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-4 pr-12 py-3 rounded-lg transition-all ${
                    isDarkMode
                      ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary focus:border-purple-500'
                      : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary focus:border-purple-500'
                  } border focus:ring-2 focus:ring-purple-500/20`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-3.5 ${
                    isDarkMode ? 'text-dark-text-secondary hover:text-dark-text-primary' : 'text-light-text-secondary hover:text-light-text-primary'
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'La confirmación es obligatoria',
                    validate: value => value === newPassword || 'Las contraseñas no coinciden'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full pl-4 pr-12 py-3 rounded-lg transition-all ${
                    isDarkMode
                      ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary focus:border-purple-500'
                      : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary focus:border-purple-500'
                  } border focus:ring-2 focus:ring-purple-500/20`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-3.5 ${
                    isDarkMode ? 'text-dark-text-secondary hover:text-dark-text-primary' : 'text-light-text-secondary hover:text-dark-text-primary'
                  }`}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-t-transparent w-5 h-5 border-white"></div>
                  Restableciendo...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Restablecer Contraseña
                </>
              )}
            </button>
          </form>

          {/* Back */}
          <div className="text-center mt-6">
            <Link
              to="/forgot-password/verify"
              state={{ email }}
              className={`inline-flex items-center gap-2 text-sm transition-colors ${
                isDarkMode
                  ? 'text-dark-text-secondary hover:text-blue-400'
                  : 'text-light-text-secondary hover:text-blue-600'
              }`}
            >
              <ArrowLeft size={16} />
              Cambiar código
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
