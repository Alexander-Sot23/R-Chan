import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTheme } from '../contexts/ThemeContext';
import { useSweetAlert } from '../utils/sweetAlert';
import { adminAuthService } from '../services/adminAuthService';
import { Shield, ArrowLeft, Key } from 'lucide-react';

const VerifyResetCodePage = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const { isDarkMode } = useTheme();
  const { showSuccess, showError } = useSweetAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      await adminAuthService.verifyResetCode(email, data.code);
      showSuccess('Código verificado correctamente');
      //Navegar a la página de reset con email y código
      navigate('/forgot-password/reset', { state: { email, code: data.code } });
    } catch (error) {
      console.error('Error verifying code:', error);
      showError(error.message || 'Código inválido o expirado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await adminAuthService.forgotPassword(email);
      showSuccess('Se ha enviado un nuevo código a tu email');
    } catch (error) {
      showError('Error al reenviar el código');
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
            ? 'bg-gradient-to-r from-green-900/20 to-blue-900/20'
            : 'bg-gradient-to-r from-green-100/50 to-blue-100/50'
        }`}>
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${
              isDarkMode ? 'bg-green-600/20' : 'bg-green-100'
            }`}>
              <Key size={32} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
            </div>
          </div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Verificar Código
          </h1>
          <p className={`text-sm mt-2 ${
            isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
          }`}>
            Ingresa el código de 6 dígitos enviado a {email}
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Code Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Código de Verificación
              </label>
              <input
                {...register('code', {
                  required: 'El código es obligatorio',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'El código debe tener 6 dígitos'
                  }
                })}
                type="text"
                maxLength={6}
                className={`w-full px-4 py-3 rounded-lg text-center text-2xl font-mono tracking-widest transition-all ${
                  isDarkMode
                    ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary focus:border-green-500'
                    : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary focus:border-green-500'
                } border focus:ring-2 focus:ring-green-500/20`}
                placeholder="000000"
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-t-transparent w-5 h-5 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <Key size={20} />
                  Verificar Código
                </>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="text-center mt-4">
            <button
              onClick={handleResendCode}
              className={`text-sm transition-colors ${
                isDarkMode
                  ? 'text-dark-text-secondary hover:text-blue-400'
                  : 'text-light-text-secondary hover:text-blue-600'
              }`}
            >
              ¿No recibiste el código? Reenviar
            </button>
          </div>

          {/* Back */}
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className={`inline-flex items-center gap-2 text-sm transition-colors ${
                isDarkMode
                  ? 'text-dark-text-secondary hover:text-blue-400'
                  : 'text-light-text-secondary hover:text-blue-600'
              }`}
            >
              <ArrowLeft size={16} />
              Cambiar email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCodePage;
