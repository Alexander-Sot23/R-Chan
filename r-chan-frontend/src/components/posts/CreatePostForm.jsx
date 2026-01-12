import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { postService } from '../../services/postService';
import { sectionService } from '../../services/sectionService';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Upload, Info, Plus, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSweetAlert } from '../../utils/sweetAlert';

const CreatePostForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState(undefined);
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const { isDarkMode } = useTheme();
  const { showSuccess, showError } = useSweetAlert();

  useEffect(() => {
    const loadSections = async () => {
      try {
        const data = await sectionService.getSections(0, 20);
        //Las secciones ya vienen con sectionType (Enum) desde tu backend
        setSections(data.content || []);
      } catch (error) {
        console.error('Error cargando secciones:', error);
      } finally {
        setLoadingSections(false);
      }
    };
    loadSections();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    //Validar tipo MIME (15MB máximo)
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.type)) {
      showError('Tipo de archivo no permitido. Formatos: PNG, JPG, JPEG, MP4, PDF');
      e.target.value = '';
      return;
    }

    //Validar tamaño (15MB)
    if (file.size > 15 * 1024 * 1024) {
      showError('El archivo excede el límite de 15MB');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const onSubmit = async (data) => {
    if (!selectedSectionType || selectedSectionType.trim() === '') {
      showError('Por favor selecciona una sección');
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = {
        ...data,
        //Asegúrate de que el sectionType esté en MAYÚSCULAS
        sectionType: selectedSectionType.toUpperCase() // <- Esto es clave
      };

      const response = await postService.createPost(postData, selectedFile);

      reset();
      setSelectedFile(null);
      setSelectedSectionType(''); // Resetear a vacío
      setIsExpanded(false); // Colapsar el formulario después de crear el post
      window.dispatchEvent(new Event('postsUpdated'));

      //Verificar si el post está aprobado o en revisión
      if (response && (response.approvalStatus === 'APPROVED' || response.approvalStatus === 'AUTO_APPROVED')) {
        showSuccess('¡Post publicado exitosamente!');
      } else if (response && response.approvalStatus === 'PENDING') {
        showSuccess('Post enviado a revisión. Será visible una vez aprobado por un moderador.');
      } else {
        //Si no hay response o es undefined, asumir que fue exitoso pero mostrar mensaje genérico
        showSuccess('Post enviado correctamente. Si contiene archivos o palabras sensibles, será revisado antes de publicarse.');
      }
    } catch (error) {
      console.error('Error al crear post:', error);

      //Limpiar formulario incluso en error
      reset();
      setSelectedFile(null);
      setSelectedSectionType('');

      //Mostrar mensaje de error más específico
      if (error.message && error.message.includes('revisión')) {
        showSuccess('Post enviado a revisión. Será visible una vez aprobado por un moderador.');
      } else if (error.message && error.message.includes('Connection reset')) {
        showSuccess('Post enviado correctamente. Puede tardar un momento en aparecer debido a la revisión de contenido.');
      } else {
        showError(`Error: ${error.message || 'Error al crear el post'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className={`rounded-lg mb-8 shadow-xl border transition-colors duration-300 overflow-hidden ${
      isDarkMode 
        ? 'bg-dark-bg-secondary border-dark-border-primary' 
        : 'bg-light-bg-secondary border-light-border-primary'
    }`}>
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={`w-full p-4 flex items-center justify-center gap-2 font-semibold transition-all hover:opacity-90 ${
            isDarkMode 
              ? 'bg-dark-bg-tertiary text-dark-text-primary hover:bg-dark-bg-tertiary/80' 
              : 'bg-light-bg-tertiary text-light-text-primary hover:bg-light-bg-tertiary/80'
          }`}
        >
          <Plus size={20} />
          Crear nueva publicación
        </button>
      ) : (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 border-b pb-3">
            <h2 className={`text-xl font-bold ${
              isDarkMode 
                ? 'text-dark-text-primary border-dark-border-primary' 
                : 'text-light-text-primary border-light-border-primary'
            }`}>
              Crear nuevo post
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                reset();
                setSelectedFile(null);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-dark-bg-tertiary text-dark-text-secondary hover:text-dark-text-primary' 
                  : 'hover:bg-light-bg-tertiary text-light-text-secondary hover:text-light-text-primary'
              }`}
              aria-label="Cerrar formulario"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
        {/* Título */}
        <div className="mb-5">
          <label className={`block font-medium mb-2 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Título *
          </label>
          <input
            type="text"
            {...register('title', { 
              required: 'El título es obligatorio', 
              maxLength: {
                value: 255,
                message: 'El título no puede exceder 255 caracteres'
              }
            })}
            placeholder="Escribe un título"
            className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border ${
              isDarkMode 
                ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary focus:border-dark-border-accent focus:ring-dark-border-accent/50' 
                : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary focus:border-light-border-accent focus:ring-light-border-accent/50'
            }`}
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Contenido */}
        <div className="mb-5">
          <label className={`block font-medium mb-2 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Contenido <span className="text-sm opacity-75">(opcional)</span>
          </label>
          <textarea
            {...register('content', { 
              maxLength: {
                value: 500,
                message: 'El contenido no puede exceder 500 caracteres'
              }
            })}
            rows="4"
            placeholder="Escribe tu mensaje aquí..."
            className={`w-full px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-1 border ${
              isDarkMode 
                ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary placeholder-dark-text-secondary focus:border-dark-border-accent focus:ring-dark-border-accent/50' 
                : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary placeholder-light-text-secondary focus:border-light-border-accent focus:ring-light-border-accent/50'
            }`}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-sm ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
            }`}>
              Máximo 500 caracteres
            </span>
            {errors.content && (
              <span className="text-red-400 text-sm">{errors.content.message}</span>
            )}
          </div>
        </div>

        {/* Subir archivo */}
        <div className="mb-5">
          <label className={`block font-medium mb-2 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Subir archivo <span className="text-sm opacity-75">(opcional)</span>
          </label>
          <div className="flex items-center gap-3 mb-2">
            <label className={`cursor-pointer border-2 border-dashed rounded-lg flex items-center gap-3 px-6 py-4 transition-all ${
              isDarkMode 
                ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary hover:border-dark-border-accent' 
                : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary hover:border-light-border-accent'
            }`}>
              <Upload size={20} />
              <span>Seleccionar archivo</span>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
                accept=".png,.jpg,.jpeg,.mp4,.pdf" 
              />
            </label>
            <span className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
              {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
            </span>
          </div>
          <p className={isDarkMode ? 'text-dark-text-secondary text-sm' : 'text-light-text-secondary text-sm'}>
            Formatos permitidos: PNG, JPG, JPEG, MP4, PDF. Tamaño máximo: 15MB
          </p>
        </div>

        {/* Sección - USANDO sectionType (Enum) */}
        <div className="mb-6">
          <label className={`block font-medium mb-2 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Sección *
            {loadingSections && (
              <span className="text-sm ml-2">(cargando...)</span>
            )}
          </label>
          
          <Select.Root
            value={selectedSectionType || ''}
            onValueChange={setSelectedSectionType}
            disabled={loadingSections}
          >
            <Select.Trigger 
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border ${
                isDarkMode 
                  ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary focus:border-dark-border-accent focus:ring-dark-border-accent/50 disabled:opacity-50' 
                  : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary focus:border-light-border-accent focus:ring-light-border-accent/50 disabled:opacity-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedSectionType && sections.find(s => (s.sectionEnumType || s.sectionType) === selectedSectionType) && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: sectionColors[selectedSectionType] || '#6b7280'
                    }}
                  />
                )}
                <Select.Value placeholder={
                  loadingSections 
                    ? "Cargando secciones..." 
                    : "Seleccionar sección"
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
                  {/* Todas las secciones incluyendo GENERAL */}
                  {sections.map((section) => (
                    <Select.Item
                      key={section.id}
                      value={section.sectionEnumType?.toString() || section.sectionEnumType}
                      className={`px-3 py-2 rounded cursor-pointer ${
                        isDarkMode
                          ? 'text-dark-text-primary hover:bg-dark-bg-tertiary'
                          : 'text-light-text-primary hover:bg-light-bg-tertiary'
                      }`}
                    >
                      <Select.ItemText key={section.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: sectionColors[section.sectionEnumType || section.sectionType] || '#6b7280' }}
                            />
                            <span className="font-medium">
                              {section.displayName}
                            </span>
                          </div>
                          <Info size={14} className="opacity-50" />
                        </div>
                        <p className="text-xs opacity-75 mt-1 ml-5">
                          {section.description}
                        </p>
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Botón de enviar */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Publicando...
            </span>
          ) : 'Publicar'}
        </button>
      </form>
    </div>
      )}
    </div>
  );
};

export default CreatePostForm;