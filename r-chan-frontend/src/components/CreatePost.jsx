import React, { useState } from 'react';
import { postService } from '../services/postService';
import Swal from 'sweetalert2';

const CreatePost = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gender: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const maxSize = 50 * 1024 * 1024; //Tamaño ma 50MB
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
    
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    //Validación final de tamaño
    if (file) {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        Swal.fire({
          title: 'Archivo demasiado grande',
          text: `El archivo "${file.name}" excede el límite de 50MB`,
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('gender', formData.gender);
      
      if (file) {
        formDataToSend.append('file', file);
      }

      const response = await postService.createPost(formDataToSend);
      onPostCreated(response.data);
      
      setFormData({
        title: '',
        description: '',
        gender: ''
      });
      setFile(null);
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      Swal.fire({
        title: 'Post creado',
        text: 'Tu publicación ha sido creada exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error('Error creando post:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el post. Por favor, intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <h2>Crear Nuevo Post</h2>
      
      <div className="form-group">
        <input
          type="text"
          name="title"
          placeholder="Título del post"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <textarea
          name="description"
          placeholder="Descripción"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
        />
      </div>
      
      <div className="form-group">
        <label className="file-label">Subir archivo (opcional)</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".png,.jpg,.jpeg,.mp4,.pdf"
          className="file-input"
        />
        <div className="file-info">
          <small>Formatos permitidos: PNG, JPG, JPEG, MP4, PDF</small>
          <small className="file-size-info">Tamaño máximo: 50MB</small>
        </div>
      </div>
      
      <div className="form-group">
        <input
          type="text"
          name="gender"
          placeholder="Género (opcional)"
          value={formData.gender}
          onChange={handleChange}
        />
      </div>
      
      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Publicando...' : 'Publicar Post'}
      </button>
    </form>
  );
};

export default CreatePost;