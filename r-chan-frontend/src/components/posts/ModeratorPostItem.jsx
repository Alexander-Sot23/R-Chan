import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CenteredMedia from '../ui/CenteredMedia';
import { useTheme } from '../../contexts/ThemeContext';
import { useSweetAlert } from '../../utils/sweetAlert';
import { moderatorPostService } from '../../services/moderatorPostService';
import { MessageSquare, Image, File, MoreVertical, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const ModeratorPostItem = ({ post, onUpdate, onToggleReplies, isExpanded, repliesCount }) => {
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showWarning } = useSweetAlert();
  const [showActions, setShowActions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'REJECTED':
        return <XCircle size={14} className="text-red-500" />;
      case 'PENDING':
        return <Clock size={14} className="text-yellow-500" />;
      case 'AUTO_APPROVED':
        return <CheckCircle size={14} className="text-emerald-500" />;
      default:
        return <AlertTriangle size={14} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'AUTO_APPROVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getFileStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle size={12} className="text-green-500" />;
      case 'REJECTED':
        return <XCircle size={12} className="text-red-500" />;
      case 'PENDING':
        return <Clock size={12} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getFileStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Aprobado';
      case 'REJECTED':
        return 'Rechazado';
      case 'PENDING':
        return 'Pendiente';
      case 'VISIBLE':
        return '';
      case 'HIDDEN':
        return 'Oculto';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  const handleDelete = async () => {
    const confirmed = await showWarning(
      '¿Estás seguro de que quieres eliminar esta publicación?',
      'Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      await moderatorPostService.deletePost(post.id);
      showSuccess('Publicación eliminada exitosamente');
      onUpdate();
    } catch (error) {
      showError('Error al eliminar la publicación: ' + error.message);
    }
  };

  const handleEdit = async (data) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        title: data.title,
        content: data.content,
        sectionType: post.section?.sectionType || post.section,
        fileStatus: data.fileStatus || 'VISIBLE',
        approvalStatus: data.approvalStatus || post.approvalStatus
      };

      await moderatorPostService.updatePost(post.id, updateData);
      showSuccess('Publicación actualizada exitosamente');
      setShowEditModal(false);
      onUpdate();
    } catch (error) {
      showError('Error al actualizar la publicación: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovalChange = async (newStatus) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        title: post.title,
        content: post.content,
        sectionType: post.section?.sectionType || post.section,
        fileStatus: post.fileStatus || 'VISIBLE',
        approvalStatus: newStatus
      };

      await moderatorPostService.updatePost(post.id, updateData);
      showSuccess(`Estado de aprobación cambiado a ${newStatus}`);
      setShowApprovalModal(false);
      onUpdate();
    } catch (error) {
      showError('Error al cambiar el estado de aprobación: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = () => {
    reset({
      title: post.title,
      content: post.content || '',
      fileStatus: post.fileStatus || 'VISIBLE',
      approvalStatus: post.approvalStatus || 'PENDING'
    });
    setShowEditModal(true);
    setShowActions(false);
  };

  const openApprovalModal = () => {
    setShowApprovalModal(true);
    setShowActions(false);
  };

  return (
    <>
      <div className={`rounded-lg border transition-all duration-200 hover:shadow-md ${
        isDarkMode
          ? 'bg-dark-bg-secondary border-dark-border-primary hover:border-dark-border-accent'
          : 'bg-light-bg-secondary border-light-border-primary hover:border-light-border-accent'
      }`}>

      {/* Header con información del post */}
      <div className="p-4">
        <div className="flex items-start justify-center relative">
          <div className="flex-1">
            {/* Título y sección */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold text-lg ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                {post.title}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                isDarkMode ? 'bg-dark-bg-tertiary text-dark-text-secondary' : 'bg-light-bg-tertiary text-light-text-secondary'
              }`}>
                {post.section?.displayName || post.section?.sectionType || 'Sin sección'}
              </span>
            </div>

            {/* Contenido */}
            {post.content && (
              <p className={`text-sm mb-3 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                {post.content}
              </p>
            )}

            {/* Información del archivo */}
            {post.fileUrl && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  {post.fileType === 'IMAGE' && <Image size={16} className="text-blue-500" />}
                  {post.fileType === 'VIDEO' && <File size={16} className="text-red-500" />}
                  {post.fileType === 'DOCUMENT' && <File size={16} className="text-green-500" />}
                  <span className={`text-sm ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Archivo adjunto ({post.fileType})
                  </span>
                </div>
                {/* Mostrar archivo */}
                <CenteredMedia
                  fileUrl={post.fileUrl}
                  alt={post.title || "Archivo adjunto"}
                  fileType={post.fileType}
                />
              </div>
            )}

            {/* Información de respuestas y fechas */}
            <div className="flex items-center gap-4 text-sm">
              <span className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
                {formatDate(post.createdDate)}
                {post.updatedDate && post.updatedDate !== post.createdDate && (
                  <span className="ml-2 text-xs opacity-75">
                    (modificado: {formatDate(post.updatedDate)})
                  </span>
                )}
              </span>
            </div>

            {/* Menú de acciones */}
            <div className="absolute top-0 right-0">
            <button
              onClick={() => setShowActions(!showActions)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-dark-bg-tertiary text-dark-text-secondary'
                  : 'hover:bg-light-bg-tertiary text-light-text-secondary'
              }`}
            >
              <MoreVertical size={16} />
            </button>

            {/* Dropdown de acciones */}
            {showActions && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-10 ${
                isDarkMode
                  ? 'bg-dark-bg-secondary border-dark-border-primary'
                  : 'bg-light-bg-secondary border-light-border-primary'
              }`}>
                <div className="py-1">
                  <button
                    onClick={() => {
                      openEditModal();
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${
                      isDarkMode
                        ? 'text-dark-text-primary hover:bg-dark-bg-tertiary'
                        : 'text-light-text-primary hover:bg-light-bg-tertiary'
                    }`}
                  >
                    <Edit size={14} />
                    Editar publicación
                  </button>
                  <button
                    onClick={() => {
                      openApprovalModal();
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${
                      isDarkMode
                        ? 'text-dark-text-primary hover:bg-dark-bg-tertiary'
                        : 'text-light-text-primary hover:bg-light-bg-tertiary'
                    }`}
                  >
                    <CheckCircle size={14} />
                    Cambiar aprobación
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      handleDelete();
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 transition-colors ${
                      isDarkMode
                        ? 'hover:bg-red-900/20'
                        : 'hover:bg-red-50'
                    }`}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer con indicadores de status */}
      <div className={`px-4 py-3 border-t ${
        isDarkMode ? 'border-dark-border-primary bg-dark-bg-tertiary' : 'border-light-border-primary bg-light-bg-tertiary'
      }`}>
        <div className="flex items-center justify-between">
          {/* Status de aprobación */}
          <div className="flex items-center gap-2">
            {getStatusIcon(post.approvalStatus)}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(post.approvalStatus)}`}>
              {post.approvalStatus === 'AUTO_APPROVED' ? 'Auto-aprobado' :
               post.approvalStatus === 'APPROVED' ? 'Aprobado' :
               post.approvalStatus === 'REJECTED' ? 'Rechazado' :
               post.approvalStatus === 'PENDING' ? 'Pendiente' : post.approvalStatus}
            </span>
          </div>

          {/* Botón ver respuestas y status del archivo */}
          <div className="flex items-center gap-3">
            {/* Botón ver respuestas */}
            <button
              onClick={onToggleReplies}
              className={`flex items-center gap-1 text-xs px-3 py-1 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              <MessageSquare size={12} />
              {isExpanded ? 'Ocultar' : 'Ver'} respuestas ({repliesCount})
            </button>

            {/* Status del archivo */}
            {post.fileStatus && (
              <div className="flex items-center gap-2">
                {getFileStatusIcon(post.fileStatus)}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Modal Editar Publicación */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode
              ? 'bg-dark-bg-secondary border border-dark-border-primary'
              : 'bg-light-bg-secondary border border-light-border-primary'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  Editar Publicación
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                  }`}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
                <div>
                  <label className={`block font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Título *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'El título es obligatorio' })}
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary focus:border-dark-border-accent focus:ring-dark-border-accent/50'
                        : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary focus:border-light-border-accent focus:ring-light-border-accent/50'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className={`block font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    Contenido
                  </label>
                  <textarea
                    {...register('content')}
                    rows="4"
                    className={`w-full px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-1 border ${
                      isDarkMode
                        ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary focus:border-dark-border-accent focus:ring-dark-border-accent/50'
                        : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary focus:border-light-border-accent focus:ring-light-border-accent/50'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-medium mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Estado de archivo
                    </label>
                    <select
                      {...register('fileStatus')}
                      className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border ${
                        isDarkMode
                          ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary focus:border-dark-border-accent focus:ring-dark-border-accent/50'
                          : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary focus:border-light-border-accent focus:ring-light-border-accent/50'
                      }`}
                    >
                      <option value="VISIBLE">Visible</option>
                      <option value="HIDDEN">Oculto</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-medium mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                    }`}>
                      Estado de aprobación
                    </label>
                    <select
                      {...register('approvalStatus')}
                      className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border ${
                        isDarkMode
                          ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary focus:border-dark-border-accent focus:ring-dark-border-accent/50'
                          : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary focus:border-light-border-accent focus:ring-light-border-accent/50'
                      }`}
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="APPROVED">Aprobado</option>
                      <option value="AUTO_APPROVED">Auto-aprobado</option>
                      <option value="REJECTED">Rechazado</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-tertiary'
                        : 'border-light-border-primary text-light-text-primary hover:bg-light-bg-tertiary'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Estado de Aprobación */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-md w-full ${
            isDarkMode
              ? 'bg-dark-bg-secondary border border-dark-border-primary'
              : 'bg-light-bg-secondary border border-light-border-primary'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  Cambiar Estado de Aprobación
                </h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-dark-bg-tertiary' : 'hover:bg-light-bg-tertiary'
                  }`}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleApprovalChange('PENDING')}
                  disabled={isSubmitting}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    post.approvalStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>Pendiente</span>
                  </div>
                </button>

                <button
                  onClick={() => handleApprovalChange('APPROVED')}
                  disabled={isSubmitting}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    post.approvalStatus === 'APPROVED'
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} />
                    <span>Aprobado</span>
                  </div>
                </button>

                <button
                  onClick={() => handleApprovalChange('REJECTED')}
                  disabled={isSubmitting}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    post.approvalStatus === 'REJECTED'
                      ? 'bg-red-100 text-red-800 border-2 border-red-300'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    <XCircle size={18} />
                    <span>Rechazado</span>
                  </div>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-tertiary'
                      : 'border-light-border-primary text-light-text-primary hover:bg-light-bg-tertiary'
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModeratorPostItem;