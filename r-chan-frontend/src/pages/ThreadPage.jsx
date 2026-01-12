import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Header from '../components/layout/Header';
import PostItem from '../components/posts/PostItem';
import CreateRepostForm from '../components/posts/CreateRepostForm';
import RepostItem from '../components/posts/RepostItem';
import { postService } from '../services/postService';
import { repostService } from '../services/repostService';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, X } from 'lucide-react';

const ThreadPage = () => {
  const { postId } = useParams();
  const { isDarkMode } = useTheme();
  const [post, setPost] = useState(null);
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRepostFormExpanded, setIsRepostFormExpanded] = useState(false);

  const loadThreadData = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      //Cargar post principal y reposts en paralelo para mejor rendimiento
      const [postData, repostsData] = await Promise.all([
        postService.getPostById(postId),
        repostService.getRepostsByPostId(postId)
      ]);
      
      setPost(postData);
      setReposts(repostsData || []);
    } catch (err) {
      console.error('Error cargando hilo:', err);
      setError(err.message || 'No se pudo cargar el hilo');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadThreadData();
  }, [loadThreadData]);

  const handleRepostCreated = () => {
    //Recargar los reposts después de crear uno nuevo
    repostService.getRepostsByPostId(postId)
      .then(data => setReposts(data || []))
      .catch(err => {
        console.error('Error recargando reposts:', err);
        setError(err.message || 'Error al recargar respuestas');
      });

    //Colapsar el formulario después de crear la respuesta
    setIsRepostFormExpanded(false);
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg-primary' : 'bg-light-bg-primary'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${isDarkMode ? 'border-dark-text-accent' : 'border-light-text-accent'}`}></div>
          <p className={`mt-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Cargando hilo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg-primary' : 'bg-light-bg-primary'} flex items-center justify-center`}>
        <div className={`p-8 rounded border max-w-md ${isDarkMode ? 'bg-dark-bg-secondary border-red-600/50' : 'bg-light-bg-secondary border-red-300'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Error</h3>
          <p className={`mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>{error}</p>
          <button
            onClick={loadThreadData}
            className={`px-4 py-2 rounded hover:opacity-90 transition-opacity ${isDarkMode ? 'bg-dark-text-accent text-dark-bg-primary' : 'bg-light-text-accent text-white'}`}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg-primary' : 'bg-light-bg-primary'} flex items-center justify-center`}>
        <div className="text-center">
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>Post no encontrado</h3>
          <p className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>El hilo que buscas no existe o fue eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg-primary' : 'bg-light-bg-primary'}`}>
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/*Post principal*/}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <span className={`text-lg font-semibold mr-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
              Post original
            </span>
            <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-dark-bg-tertiary text-dark-text-secondary border border-dark-border-primary' : 'bg-light-bg-tertiary text-light-text-secondary border border-light-border-primary'}`}>
              {post.section?.name || 'General'}
            </span>
          </div>
          <PostItem post={post} />
        </div>

        {/*Formulario para respuesta*/}
        <div className={`rounded-lg mb-8 shadow-xl border transition-colors duration-300 overflow-hidden ${
          isDarkMode
            ? 'bg-dark-bg-secondary border-dark-border-primary'
            : 'bg-light-bg-secondary border-light-border-primary'
        }`}>
          {!isRepostFormExpanded ? (
            <button
              type="button"
              onClick={() => setIsRepostFormExpanded(true)}
              className={`w-full p-4 flex items-center justify-center gap-2 font-semibold transition-all hover:opacity-90 ${
                isDarkMode
                  ? 'bg-dark-bg-tertiary text-dark-text-primary hover:bg-dark-bg-tertiary/80'
                  : 'bg-light-bg-tertiary text-light-text-primary hover:bg-light-bg-tertiary/80'
              }`}
            >
              <Plus size={20} />
              Responder a este hilo
            </button>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b pb-3">
                <h2 className={`text-xl font-bold ${
                  isDarkMode
                    ? 'text-dark-text-primary border-dark-border-primary'
                    : 'text-light-text-primary border-light-border-primary'
                }`}>
                  Responder a este hilo
                </h2>
                <button
                  type="button"
                  onClick={() => setIsRepostFormExpanded(false)}
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
              <CreateRepostForm
                postId={postId}
                onRepostCreated={handleRepostCreated}
                showContainer={false}
              />
            </div>
          )}
        </div>

        {/*Lista de respuestas*/}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
              {reposts.length} {reposts.length === 1 ? 'respuesta' : 'respuestas'}
            </h3>
            <span className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Ordenadas por fecha
            </span>
          </div>
          
          {reposts.length === 0 ? (
            <div className={`rounded border p-8 text-center ${isDarkMode ? 'bg-dark-bg-secondary border-dark-border-primary' : 'bg-light-bg-secondary border-light-border-primary'}`}>
              <p className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
                Aún no hay respuestas. ¡Sé el primero en responder!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reposts.map((repost) => (
                <RepostItem key={repost.id} repost={repost} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ThreadPage;