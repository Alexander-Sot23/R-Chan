import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { repostService } from '../../services/repostService';
import { Upload } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSweetAlert } from '../../utils/sweetAlert';

//eslint-disable-next-line no-unused-vars
const CreateRepostForm = ({ postId, onRepostCreated, showContainer }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const { isDarkMode } = useTheme();
  const { showSuccess, showError } = useSweetAlert();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Watch para el contenido del formulario
  const watchedContent = watch('content');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 15 * 1024 * 1024) {
      showError('El archivo excede el límite de 15MB');
      return;
    }
    setSelectedFile(file);
  };

  const onSubmit = async (data) => {
    if (!postId) {
      showError('Error: No se pudo identificar el post');
      return;
    }

    //Validar que al menos haya contenido o archivo
    const hasContent = data.content && data.content.trim().length > 0;
    const hasFile = selectedFile !== null;

    if (!hasContent && !hasFile) {
      showError('Debes proporcionar al menos contenido de texto o un archivo');
      return;
    }

    setIsSubmitting(true);
    let response;

    try {
      const repostData = {
        ...data,
        postId: postId
      };

      response = await repostService.createRepost(repostData, selectedFile);

      //Limpiar formulario
      reset();
      setSelectedFile(null);

      //Notificar al componente padre que se creó un nuevo repost
      if (onRepostCreated) {
        onRepostCreated();
      }

      //Verificar si el repost está aprobado o en revisión
      if (response && (response.approvalStatus === 'APPROVED' || response.approvalStatus === 'AUTO_APPROVED')) {
        showSuccess('¡Respuesta publicada exitosamente!');
      } else if (response && response.approvalStatus === 'PENDING') {
        showSuccess('Respuesta enviada a revisión. Será visible una vez aprobado por un moderador.');
      } else {
        //Si no hay response o es undefined, asumir que fue exitoso pero mostrar mensaje genérico
        showSuccess('Respuesta enviada correctamente. Si contiene archivos, será revisada antes de publicarse.');
      }
    } catch (error) {
      console.error('Error al crear repost:', error);
      console.error('Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      //Limpiar formulario incluso en error
      reset();
      setSelectedFile(null);

      //Si hay respuesta pero con error controlado, mostrar mensaje de revisión
      if (response && (response.approvalStatus === 'PENDING' || response.approvalStatus === 'APPROVED' || response.approvalStatus === 'AUTO_APPROVED')) {
        showSuccess('Respuesta enviada correctamente. ' + (response.approvalStatus === 'PENDING' ? 'Será visible una vez aprobado por un moderador.' : '¡Publicado exitosamente!'));
      } else if (error.message && error.message.includes('Connection reset')) {
        showSuccess('Respuesta enviada correctamente. Puede tardar un momento en aparecer debido a la revisión de contenido.');
      } else {
        showError(`Error al publicar: ${error.message || 'Error desconocido'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <>
      {!showContainer && (
        <h2 className={`text-xl font-bold mb-6 border-b pb-3 ${
          isDarkMode
            ? 'text-dark-text-primary border-dark-border-primary'
            : 'text-light-text-primary border-light-border-primary'
        }`}>
          Responder a este hilo
        </h2>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Contenido */}
        <div className="mb-5">
          <label className={`block font-medium mb-2 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Contenido {!selectedFile && <span className="text-red-500">*</span>}
          </label>
          <textarea
            {...register('content', {
              maxLength: {
                value: 500,
                message: 'Máximo 500 caracteres'
              },
              //Solo requerido si no hay archivo
              validate: (value) => {
                if (!selectedFile && (!value || value.trim().length === 0)) {
                  return 'El contenido es obligatorio cuando no hay archivo adjunto';
                }
                return true;
              }
            })}
            rows="4"
            placeholder="Escribe tu respuesta aquí..."
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
              Máximo 500 caracteres{selectedFile && ' (opcional cuando hay archivo)'}
            </span>
            {errors.content && (
              <span className="text-red-400 text-sm">{errors.content.message}</span>
            )}
          </div>
        </div>

        {/* Subir archivo */}
        <div className="mb-6">
          <label className={`block font-medium mb-2 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
          }`}>
            Subir archivo {!watchedContent?.trim() && <span className="text-red-500">*</span>}
            <span className="text-sm opacity-75"> (opcional cuando hay contenido)</span>
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

        {/* Botón de enviar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2 px-6 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2 ${
              isDarkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Publicando...
              </>
            ) : 'Publicar respuesta'}
          </button>
        </div>
      </form>
    </>
  );

  return showContainer ? (
    <div className={`rounded-lg p-6 mb-8 shadow-xl border transition-colors duration-300 ${
      isDarkMode
        ? 'bg-dark-bg-secondary border-dark-border-primary'
        : 'bg-light-bg-secondary border-light-border-primary'
    }`}>
      <h2 className={`text-xl font-bold mb-6 border-b pb-3 ${
        isDarkMode
          ? 'text-dark-text-primary border-dark-border-primary'
          : 'text-light-text-primary border-light-border-primary'
      }`}>
        Responder a este hilo
      </h2>
      {formContent}
    </div>
  ) : formContent;
};

export default CreateRepostForm;