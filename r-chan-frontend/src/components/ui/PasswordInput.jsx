import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
  value,
  onChange,
  placeholder = "Contraseña",
  className = "",
  isDarkMode = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 pr-10 rounded-lg border ${
          isDarkMode
            ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary'
            : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
          isDarkMode ? 'text-dark-text-secondary hover:text-dark-text-primary' : 'text-light-text-secondary hover:text-light-text-primary'
        }`}
        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? (
          <EyeOff size={18} />
        ) : (
          <Eye size={18} />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;






