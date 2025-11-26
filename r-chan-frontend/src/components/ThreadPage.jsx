import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { rePostService } from '../services/rePostService';
import { fileService } from '../services/fileService';
import Swal from 'sweetalert2';

const ThreadPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyFormData, setReplyFormData] = useState({
    description: '',
    file: null
  });
  const [replyLoading, setReplyLoading] = useState(false);

  //Funcion para manejar descarga de archivos
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
        title: 'Error',
        text: 'No se pudo descargar el archivo',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const renderFilePreview = (filePath) => {
    if (!filePath) return null;

    const fileType = fileService.getFileType(filePath);
    const fileUrl = fileService.getFileUrl(filePath);
    const originalName = fileService.extractOriginalName(filePath);

    switch (fileType) {
      case 'image':
        return (
          <div className="file-preview image-preview">
            <img 
              src={fileUrl} 
              alt={originalName}
              className="preview-image"
              onClick={() => handleDownload(filePath)}
            />
            <div className="file-actions">
              <button 
                className="btn-download"
                onClick={() => handleDownload(filePath)}
              >
                Descargar imagen
              </button>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="file-preview video-preview">
            <video controls className="preview-video">
              <source src={fileUrl} type="video/mp4" />
              Tu navegador no soporta el elemento video.
            </video>
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

  //Cargamos el post original y sus respuestas
  useEffect(() => {
    const loadThread = async () => {
      try {
        //Cargar el post original
        const postResponse = await postService.getPostById(postId);
        setPost(postResponse.data);

        //Cargar todos las respuestas del post
        const repostsResponse = await rePostService.getRePostsByPostId(postId);
        setReposts(repostsResponse.data);
      } catch (error) {
        console.error('Error cargando el hilo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThread();
  }, [postId]);

  //Funcion para abrir/cerrar el formulario de respuesta
  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
    if (showReplyForm) {
      setReplyFormData({ description: '', file: null });
    }
  };

  //Manejar cambios en el formulario de respuesta
  const handleReplyFormChange = (e) => {
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
      
      setReplyFormData(prev => ({
        ...prev,
        file: selectedFile
      }));
    } else {
      setReplyFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  //Enviar respuesta
  const handleReplySubmit = async () => {
    if (!replyFormData.description.trim()) {
      Swal.fire({
        title: 'Campo requerido',
        text: 'La descripción es obligatoria',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (replyFormData.file) {
      const maxSize = 50 * 1024 * 1024;
      if (replyFormData.file.size > maxSize) {
        Swal.fire({
          title: 'Archivo demasiado grande',
          text: `El archivo "${replyFormData.file.name}" excede el límite de 50MB`,
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    }

    setReplyLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', replyFormData.description);
      if (replyFormData.file) {
        formData.append('file', replyFormData.file);
      }

      await rePostService.createRePost(postId, formData);
      
      const repostsResponse = await rePostService.getRePostsByPostId(postId);
      setReposts(repostsResponse.data);
      
      setShowReplyForm(false);
      setReplyFormData({ description: '', file: null });
      
      Swal.fire({
        title: 'Respuesta publicada',
        text: 'Tu respuesta ha sido publicada exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error('Error creando respuesta:', error);
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
      setReplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="thread-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Cargando hilo...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="thread-loading">
        <div className="no-posts">
          <p>Post no encontrado</p>
          <button 
            className="btn-back"
            onClick={() => navigate('/')}
          >
            Volver al Foro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="thread-page">
      <header className="thread-header">
        <button 
          className="btn-back"
          onClick={() => navigate('/')}
        >
          Volver al Foro
        </button>
        <h1>Hilo Completo</h1>
      </header>

      <main className="thread-main">
        <div className="post-card original-post">
          <h2>{post.title}</h2>
          <p className="post-description">{post.description}</p>
          
          {post.filePath && renderFilePreview(post.filePath)}
          
          <div className="post-meta">
            <span className="post-replies-count">
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
              className={`btn-reply ${showReplyForm ? 'active' : ''}`}
              onClick={toggleReplyForm}
            >
              {showReplyForm ? 'Cancelar' : 'Responder'}
            </button>
          </div>

          {showReplyForm && (
            <div className="reply-form">
              <h4>Escribe tu respuesta</h4>
              <div className="form-group">
                <textarea
                  name="description"
                  placeholder="Escribe tu respuesta..."
                  value={replyFormData.description}
                  onChange={handleReplyFormChange}
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label className="file-label">Subir archivo (opcional)</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleReplyFormChange}
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
                  onClick={handleReplySubmit}
                  disabled={replyLoading}
                  className="btn-submit"
                >
                  {replyLoading ? 'Publicando...' : 'Publicar Respuesta'}
                </button>
              </div>
            </div>
          )}
        </div>

        {reposts.length > 0 ? (
          <div className="replies-full-list">
            <h3>Respuestas ({reposts.length})</h3>
            {reposts.map(repost => (
              <div key={repost.id} className="post-card reply-card">
                <div className="reply-content">
                  <p className="reply-description">{repost.description}</p>
                  
                  {repost.filePath && renderFilePreview(repost.filePath)}
                </div>
                
                <div className="post-meta">
                  <span className="post-date">
                    {new Date(repost.creationDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-replies">
            <p>Este post aún no tiene respuestas. ¡Sé el primero en responder!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ThreadPage;