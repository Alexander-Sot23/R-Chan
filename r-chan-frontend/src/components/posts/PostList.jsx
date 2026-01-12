import { useState, useEffect } from 'react';
import PostItem from './PostItem';
import { postService } from '../../services/postService';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PostList = ({ sectionType = null }) => {
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const loadPosts = async (pageNum, sectionFilter = null) => {
    setLoading(true);
    try {
      const data = await postService.getPosts(pageNum, 10, 'createdDate', sectionFilter);

      if (pageNum === 0) {
        setPosts(data.content || []);
      } else {
        setPosts(prev => [...prev, ...(data.content || [])]);
      }

      const isLastPage = data.last === true;
      const isEmptyPage = !data.content || data.content.length === 0;
      const hasLessThanPageSize = data.content && data.content.length < 10;

      setHasMore(!isLastPage && !isEmptyPage && !hasLessThanPageSize);

      if (data.totalElements) {
        setTotalPosts(data.totalElements);
      }
    } catch (error) {
      console.error('Error cargando posts:', error);
      setHasMore(false); // En caso de error, no permitir cargar más
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setPosts([]);
    loadPosts(0, sectionType);

    const handlePostsUpdated = () => {
      setPage(0);
      setPosts([]);
      loadPosts(0, sectionType);
    };
    window.addEventListener('postsUpdated', handlePostsUpdated);
    return () => window.removeEventListener('postsUpdated', handlePostsUpdated);
  }, [sectionType]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, sectionType);
    }
  };

  //Calcular cuántos posts nuevos se cargarían
  const postsToLoad = Math.min(10, totalPosts - posts.length);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#f0f6fc' }}>
      </h2>
      
      {/* Estado cuando no hay posts */}
      {posts.length === 0 && !loading && (
        <div className={`text-center py-10 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          {sectionType 
            ? 'No hay posts en esta sección todavía. ¡Sé el primero en publicar!' 
            : 'No hay posts todavía. ¡Sé el primero en publicar!'}
        </div>
      )}
      
      {/* Lista de posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
      
      {/* Botón de cargar más - SOLO si hay más posts */}
      {hasMore && posts.length > 0 && (
        <div className="mt-10 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={`group relative inline-flex items-center gap-3 py-3 px-6 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border ${
              isDarkMode
                ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-secondary'
                : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary hover:bg-light-bg-secondary'
            }`}
          >
            <span 
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-blue-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
            ></span>
            
            {loading ? (
              <>
                <div className="animate-spin rounded-full border-2 border-t-transparent w-5 h-5"></div>
                Cargando...
              </>
            ) : (
              <>
                <RefreshCw 
                  size={18} 
                  className="group-hover:rotate-180 transition-transform duration-500"
                />
                Cargar más posts
                {postsToLoad > 0 && (
                  <span className={`text-sm px-2 py-1 rounded-full ml-2 ${
                    isDarkMode 
                      ? 'bg-dark-bg-primary text-dark-text-secondary' 
                      : 'bg-light-bg-primary text-light-text-secondary'
                  }`}>
                    +{postsToLoad} nuevos
                  </span>
                )}
              </>
            )}
          </button>
          
          {/* Indicador de paginación */}
          <p className={`text-sm mt-3 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Mostrando {posts.length} de {totalPosts > 0 ? totalPosts : '?'} posts
          </p>
        </div>
      )}
      
      {/* Mensaje cuando no hay más posts */}
      {!hasMore && posts.length > 0 && (
        <div className={`text-center py-6 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
          <p>Has visto todos los posts.</p>
        </div>
      )}
    </div>
  );
};

export default PostList;