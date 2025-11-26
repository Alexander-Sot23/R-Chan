import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rePostService } from '../services/rePostService';
import { fileService } from '../services/fileService';
import Swal from 'sweetalert2';

const PostList = ({ posts }) => {
  const navigate = useNavigate();
  const [repostsByPost, setRepostsByPost] = useState({});
  const [repostFormOpen, setRepostFormOpen] = useState(null);
  const [repostFormData, setRepostFormData] = useState({
    description: '',
    file: null
  });
  const [repostLoading, setRepostLoading] = useState(false);

  // Función para manejar descarga de archivos
  const handleDownload = async (fileName) => {
    try {
      const response = await fileService.downloadFile(fileName);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const originalName = fileService.extractOriginalName(fileName);
      link.setAttribute('download', originalName);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      Swal.fire({
        title: 'Descarga exitosa',
        text: `El archivo "${originalName}" se ha descargado correctamente`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error('Error al descargar:', error);
      Swal.fire({
        title: 'Error en descarga',
        text: 'No se pudo descargar el archivo',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  };

  // Función para renderizar archivos
  const renderFilePreview = (filePath) => {
    if (!filePath) return null;

    const fileType = fileService.getFileType(filePath);
    const fileUrl = fileService.getFileUrl(filePath);
    const originalName = fileService.extractOriginalName(filePath);

    switch (fileType) {
      case 'image':
        return (
          <div className="file-preview image-preview">
            <div className="image-container">
              <img 
                src={fileUrl} 
                alt={originalName}
                className="preview-image"
                onClick={() => handleDownload(filePath)}
              />
            </div>
            <div className="file-actions">
              <button 
                className="btn-download"
                onClick={() => handleDownload(filePath)}
                title={`Descargar ${originalName}`}
              >
                Descargar imagen
              </button>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="file-preview video-preview">
            <div className="video-container">
              <video controls className="preview-video">
                <source src={fileUrl} type="video/mp4" />
                Tu navegador no soporta el elemento video.
              </video>
            </div>
            <div className="file-actions">
              <button 
                className="btn-download"
                onClick={() => handleDownload(filePath)}
              >
                Descargar video
              </button>
            </div>
          </div>
        );
      
      case 'pdf':
        return (
          <div className="file-preview pdf-preview">
            <div className="pdf-placeholder">
              <div className="pdf-icon">📄</div>
              <span className="file-name">{originalName}</span>
            </div>
            <div className="file-actions">
              <button 
                className="btn-download"
                onClick={() => handleDownload(filePath)}
              >
                Descargar PDF
              </button>
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-view"
              >
                Ver documento
              </a>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="file-preview other-preview">
            <div className="file-placeholder">
              <div className="file-icon">Archivo</div>
              <span className="file-name">{originalName}</span>
            </div>
            <div className="file-actions">
              <button 
                className="btn-download"
                onClick={() => handleDownload(filePath)}
              >
                Descargar archivo
              </button>
            </div>
          </div>
        );
    }
  };

  // Cargar reposts para cada post
  useEffect(() => {
    const loadReposts = async () => {
      const repostsData = {};
      
      for (const post of posts) {
        try {
          const response = await rePostService.getRePostsByPostId(post.id);
          repostsData[post.id] = response.data;
        } catch (error) {
          console.error(`Error cargando reposts para post ${post.id}:`, error);
          repostsData[post.id] = [];
        }
      }
      
      setRepostsByPost(repostsData);
    };

    if (posts.length > 0) {
      loadReposts();
    }
  }, [posts]);

  const getPreviewReposts = (reposts) => {
    if (!reposts || reposts.length === 0) return [];
    return reposts.slice(0, 2);
  };

  const handleViewThread = (postId) => {
    navigate(`/thread/${postId}`);
  };

  // Abrir/cerrar formulario de repost
  const toggleRepostForm = (postId) => {
    if (repostFormOpen === postId) {
      setRepostFormOpen(null);
      setRepostFormData({ description: '', file: null });
    } else {
      setRepostFormOpen(postId);
      setRepostFormData({ description: '', file: null });
    }
  };

  // Manejar cambios en el formulario de repost
  const handleRepostFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const selectedFile = files[0];
      
      // Validación de tamaño
      if (selectedFile) {
        const maxSize = 50 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
          Swal.fire({
            title: 'Archivo demasiado grande',
            text: `El archivo "${selectedFile.name}" excede el límite de 50MB`,
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
          e.target.value = '';
          return;
        }
      }
      
      setRepostFormData(prev => ({
        ...prev,
        file: selectedFile
      }));
    } else {
      setRepostFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Enviar repost
  const handleRepostSubmit = async (postId) => {
    if (!repostFormData.description.trim()) {
      Swal.fire({
        title: 'Campo requerido',
        text: 'La descripción es obligatoria',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Validación final de tamaño
    if (repostFormData.file) {
      const maxSize = 50 * 1024 * 1024;
      if (repostFormData.file.size > maxSize) {
        Swal.fire({
          title: 'Archivo demasiado grande',
          text: `El archivo "${repostFormData.file.name}" excede el límite de 50MB`,
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    }

    setRepostLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', repostFormData.description);
      if (repostFormData.file) {
        formData.append('file', repostFormData.file);
      }

      await rePostService.createRePost(postId, formData);
      
      // Recargar los reposts para este post
      const response = await rePostService.getRePostsByPostId(postId);
      setRepostsByPost(prev => ({
        ...prev,
        [postId]: response.data
      }));
      
      // Cerrar formulario y resetear datos
      setRepostFormOpen(null);
      setRepostFormData({ description: '', file: null });
      
      Swal.fire({
        title: 'Respuesta publicada',
        text: 'Tu respuesta ha sido publicada exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error('Error al crear respuesta:', error);
      let errorMessage = 'No se pudo publicar la respuesta. ';
      
      if (error.response) {
        if (error.response.status === 413) {
          errorMessage = 'El archivo es demasiado grande. Tamaño máximo: 50MB';
        } else {
          errorMessage += `Error ${error.response.status}: ${error.response.data || 'Error del servidor'}`;
        }
      } else if (error.request) {
        errorMessage += 'No se pudo conectar al servidor.';
      } else {
        errorMessage += error.message;
      }
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setRepostLoading(false);
    }
  };

  if (posts.length === 0) {
    return <div className="no-posts">No hay posts todavía. ¡Sé el primero en publicar!</div>
  }

  return (
    <div className="post-list">
      {posts.map(post => {
        const reposts = repostsByPost[post.id] || [];
        const previewReposts = getPreviewReposts(reposts);

        return (
          <div key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p className="post-description">{post.description}</p>
            
            {/* Mostrar archivo adjunto */}
            {post.filePath && renderFilePreview(post.filePath)}
            
            <div className="post-meta">
              <span className="post-reposts-count">
                {reposts.length} {reposts.length === 1 ? 'respuesta' : 'respuestas'}
              </span>
              <span className="post-gender">{post.gender || 'Sin género'}</span>
              <span className="post-date">
                {new Date(post.creationDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="post-actions">
              <button 
                className={`btn-reply ${repostFormOpen === post.id ? 'active' : ''}`}
                onClick={() => toggleRepostForm(post.id)}
              >
                {repostFormOpen === post.id ? 'Cancelar' : 'Responder'}
              </button>

              {reposts.length > 0 && (
                <button 
                  className="btn-view-thread"
                  onClick={() => handleViewThread(post.id)}
                >
                  Ver hilo ({reposts.length})
                </button>
              )}
            </div>

            {/* Formulario de Respuesta */}
            {repostFormOpen === post.id && (
              <div className="reply-form">
                <h4>Crear Respuesta</h4>
                <div className="form-group">
                  <textarea
                    name="description"
                    placeholder="Escribe tu respuesta..."
                    value={repostFormData.description}
                    onChange={handleRepostFormChange}
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="file-label">Subir archivo (opcional)</label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleRepostFormChange}
                    accept=".png,.jpg,.jpeg,.mp4,.pdf"
                    className="file-input"
                  />
                  <div className="file-info">
                    <small>Formatos permitidos: PNG, JPG, JPEG, MP4, PDF</small>
                    <small className="file-size-info">Tamaño máximo: 50MB</small>
                  </div>
                </div>
                <div className="form-actions">
                  <button 
                    onClick={() => handleRepostSubmit(post.id)}
                    disabled={repostLoading}
                    className="btn-submit"
                  >
                    {repostLoading ? 'Publicando...' : 'Publicar Respuesta'}
                  </button>
                </div>
              </div>
            )}

            {/* Previsualización de Respuestas */}
            {previewReposts.length > 0 && (
              <div className="replies-preview">
                <div className="preview-header">
                  <span className="preview-label">
                    {previewReposts.length} de {reposts.length} respuestas
                  </span>
                </div>
                
                <div className="replies-list">
                  {previewReposts.map(repost => (
                    <div key={repost.id} className="reply-card preview">
                      <div className="reply-content">
                        <p className="reply-description">{repost.description}</p>
                        {repost.filePath && renderFilePreview(repost.filePath)}
                      </div>
                      
                      <div className="reply-meta">
                        <span className="reply-date">
                          {new Date(repost.creationDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {reposts.length > 2 && (
                  <div className="preview-footer">
                    <button 
                      className="btn-view-more"
                      onClick={() => handleViewThread(post.id)}
                    >
                      Ver {reposts.length - 2} respuestas más
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PostList;