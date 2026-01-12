import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CenteredMedia from '../ui/CenteredMedia';
import { useTheme } from '../../contexts/ThemeContext';
import { useSweetAlert } from '../../utils/sweetAlert';
import { moderatorRePostService } from '../../services/moderatorRePostService';
import { MessageSquare, Image, File, MoreVertical, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Reply } from 'lucide-react';

const ModeratorRePostItem = ({ repost, onUpdate }) => {
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
      '¿Estás seguro de que quieres eliminar esta respuesta?',
      'Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      await moderatorRePostService.deleteRepost(repost.id);
      showSuccess('Respuesta eliminada exitosamente');
      //Llamar a onUpdate con un parámetro para indicar que se eliminó una respuesta
      if (onUpdate) onUpdate('repost_deleted', repost.id);
    } catch (error) {
      showError('Error al eliminar la respuesta: ' + error.message);
    }
  };

  const handleEdit = async (data) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        postId: repost.post?.id || repost.post,
        content: data.content,
        fileStatus: data.fileStatus || 'VISIBLE',
        approvalStatus: data.approvalStatus || repost.approvalStatus
      };

      await moderatorRePostService.updateRepost(repost.id, updateData);
      showSuccess('Respuesta actualizada exitosamente');
      setShowEditModal(false);
      onUpdate();
    } catch (error) {
      showError('Error al actualizar la respuesta: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovalChange = async (newStatus) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        postId: repost.post?.id || repost.post,
        content: repost.content,
        fileStatus: repost.fileStatus || 'VISIBLE',
        approvalStatus: newStatus
      };

      await moderatorRePostService.updateRepost(repost.id, updateData);
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
      content: repost.content || '',
      fileStatus: repost.fileStatus || 'VISIBLE',
      approvalStatus: repost.approvalStatus || 'PENDING'
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

      {/* Header con información de la respuesta */}
      <div className="p-4">
        <div className="flex items-start justify-center relative">
          <div className="flex-1">
            {/* Indicador de respuesta */}
            <div className="flex items-center gap-2 mb-2">
              <Reply size={16} className="text-blue-500" />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                Respuesta
              </span>
            </div>

            {/* Contenido */}
            {repost.content && (
              <p className={`text-sm mb-3 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                {repost.content}
              </p>
            )}

            {/* Información del archivo */}
            {repost.fileUrl && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  {repost.fileType === 'IMAGE' && <Image size={16} className="text-blue-500" />}
                  {repost.fileType === 'VIDEO' && <File size={16} className="text-red-500" />}
                  {repost.fileType === 'DOCUMENT' && <File size={16} className="text-green-500" />}
                  <span className={`text-sm ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    Archivo adjunto ({repost.fileType})
                  </span>
                </div>
                {/* Mostrar archivo */}
                <CenteredMedia
                  fileUrl={repost.fileUrl}
                  alt="Archivo adjunto en respuesta"
                  fileType={repost.fileType}
                />
              </div>
            )}

            {/* Información de fecha */}
            <div className="text-sm">
              <span className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
                {formatDate(repost.createdDate)}
                {repost.updatedDate && repost.updatedDate !== repost.createdDate && (
                  <span className="ml-2 text-xs opacity-75">
                    (modificado: {formatDate(repost.updatedDate)})
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
                    Editar respuesta
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
            {getStatusIcon(repost.approvalStatus)}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(repost.approvalStatus)}`}>
              {repost.approvalStatus === 'AUTO_APPROVED' ? 'Auto-aprobado' :
               repost.approvalStatus === 'APPROVED' ? 'Aprobado' :
               repost.approvalStatus === 'REJECTED' ? 'Rechazado' :
               repost.approvalStatus === 'PENDING' ? 'Pendiente' : repost.approvalStatus}
            </span>
          </div>

          {/* Status del archivo */}
          {repost.fileStatus && (
            <div className="flex items-center gap-2">
              {getFileStatusIcon(repost.fileStatus)}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Modal Editar Respuesta */}
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
                  Editar Respuesta
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
                    repost.approvalStatus === 'PENDING'
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
                    repost.approvalStatus === 'APPROVED'
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
                    repost.approvalStatus === 'REJECTED'
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

export default ModeratorRePostItem;