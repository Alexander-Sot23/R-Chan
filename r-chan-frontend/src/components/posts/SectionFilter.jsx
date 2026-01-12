import { useTheme } from '../../contexts/ThemeContext';
import * as Select from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';

const SectionFilter = ({ sections, selectedSection, onSectionChange, loading }) => {
  const { isDarkMode } = useTheme();

  //Colores para las secciones
  const sectionColors = {
    GENERAL: '#6b7280',
    TECHNOLOGY: '#3b82f6',
    SCIENCE: '#10b981',
    ARTS: '#8b5cf6',
    SPORTS: '#ef4444',
    ENTERTAINMENT: '#f59e0b',
    GAMING: '#ec4899',
    NEWS: '#6366f1'
  };

  const selectedSectionData = sections.find(s => (s.sectionEnumType || s.sectionType) === selectedSection);

  //Función para manejar el cambio de sección
  const handleSectionChange = (value) => {
    onSectionChange(value);
  };

  return (
    <div className={`rounded-lg p-4 mb-6 border transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-dark-bg-secondary border-dark-border-primary' 
        : 'bg-light-bg-secondary border-light-border-primary'
    }`}>
      <label className={`block font-medium mb-3 ${
        isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        Filtrar por sección
      </label>
      
      <Select.Root
        value={selectedSection || 'ALL'}
        onValueChange={(value) => handleSectionChange(value === 'ALL' ? null : value)}
        disabled={loading}
      >
        <Select.Trigger 
          className={`flex items-center justify-between w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border ${
            isDarkMode 
              ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary focus:border-dark-border-accent focus:ring-dark-border-accent/50 disabled:opacity-50' 
              : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary focus:border-light-border-accent focus:ring-light-border-accent/50 disabled:opacity-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Select.Value placeholder={
              loading
                ? "Cargando secciones..."
                : selectedSectionData ? selectedSectionData.displayName : "Todas las secciones"
            } />
          </div>
          <Select.Icon>
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        
        <Select.Portal>
          <Select.Content 
            className={`rounded-lg shadow-xl overflow-hidden border w-[var(--radix-select-trigger-width)] ${
              isDarkMode 
                ? 'bg-dark-bg-secondary border-dark-border-primary' 
                : 'bg-light-bg-secondary border-light-border-primary'
            }`}
          >
            <Select.Viewport className="p-1">
              {/* Opción para mostrar todas las secciones */}
              <Select.Item 
                value="ALL"
                className={`px-3 py-2 rounded cursor-pointer ${
                  isDarkMode 
                    ? 'text-dark-text-primary hover:bg-dark-bg-tertiary' 
                    : 'text-light-text-primary hover:bg-light-bg-tertiary'
                }`}
              >
                <Select.ItemText>
                  <span className="font-medium">Todas las secciones</span>
                </Select.ItemText>
              </Select.Item>
              
              {/* Todas las secciones */}
              {sections.map((section) => (
                <Select.Item
                  key={section.id}
                  value={section.sectionEnumType?.toString() || section.sectionEnumType || section.sectionType}
                  className={`px-3 py-2 rounded cursor-pointer ${
                    isDarkMode
                      ? 'text-dark-text-primary hover:bg-dark-bg-tertiary'
                      : 'text-light-text-primary hover:bg-light-bg-tertiary'
                  }`}
                >
                  <Select.ItemText>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sectionColors[section.sectionEnumType || section.sectionType] || '#6b7280' }}
                      />
                      <span className="font-medium">
                        {section.displayName}
                      </span>
                    </div>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default SectionFilter;











