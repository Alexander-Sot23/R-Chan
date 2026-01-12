import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTheme } from '../contexts/ThemeContext';
import { useSweetAlert } from '../utils/sweetAlert';
import { adminAuthService } from '../services/adminAuthService';
import { Mail, ArrowLeft, Shield } from 'lucide-react';


const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { isDarkMode } = useTheme();
  const { showSuccess, showError } = useSweetAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      await adminAuthService.forgotPassword(data.email);
      showSuccess('Se ha enviado un código de verificación a tu email');
      //Navegar a la página de verificación con el email
      navigate('/forgot-password/verify', { state: { email: data.email } });
    } catch (error) {
      console.error('Error en forgot password:', error);
      showError(error.message || 'Error al enviar el email de recuperación');
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
              isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
            }`}>
              <Shield size={32} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
            </div>
          </div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Recuperar Contraseña
          </h1>
          <p className={`text-sm mt-2 ${
            isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
          }`}>
            Ingresa tu email para recibir un código de verificación
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Email
              </label>
              <div className="relative">
                <input
                  {...register('email', {
                    required: 'El email es obligatorio',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  type="email"
                  className={`w-full pl-12 pr-4 py-3 rounded-lg transition-all ${
                    isDarkMode
                      ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary focus:border-blue-500'
                      : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary focus:border-blue-500'
                  } border focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="tu@email.com"
                />
                <Mail size={20} className={`absolute left-4 top-3.5 ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`} />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-t-transparent w-5 h-5 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Enviar Código
                </>
              )}
            </button>
          </form>


          {/* Back to Login */}
          <div className="text-center mt-4">
            <Link
              to="/administrator/login"
              className={`inline-flex items-center gap-2 text-sm transition-colors ${
                isDarkMode
                  ? 'text-dark-text-secondary hover:text-blue-400'
                  : 'text-light-text-secondary hover:text-blue-600'
              }`}
            >
              <ArrowLeft size={16} />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
