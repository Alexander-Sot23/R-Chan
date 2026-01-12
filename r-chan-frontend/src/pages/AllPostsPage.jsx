import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import ModeratorPostItem from '../components/posts/ModeratorPostItem';
import ModeratorRePostItem from '../components/posts/ModeratorRePostItem';
import { MessageSquare } from 'lucide-react';
import { moderatorPostService } from '../services/moderatorPostService';
import { moderatorRePostService } from '../services/moderatorRePostService';
import { RefreshCw, Filter, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const AllPostsPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, AUTO_APPROVED
  const [activeTab, setActiveTab] = useState('posts'); // posts, reposts
  const [expandedPosts, setExpandedPosts] = useState(new Set()); // posts con respuestas expandidas
  const [postReplies, setPostReplies] = useState(new Map()); // respuestas por post
  const [counts, setCounts] = useState({ posts: 0, reposts: 0 }); // contadores

  useEffect(() => {
    //Leer filtro inicial desde URL
    const initialFilter = searchParams.get('filter') || 'ALL';
    setFilter(initialFilter);
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [filter, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      //Cargar tanto posts como reposts para actualizar contadores
      const [postsData, repostsData] = await Promise.all([
        moderatorPostService.getPosts(0, 50, 'createdDate'),
        moderatorRePostService.getReposts(0, 50, 'createdDate')
      ]);

      //Procesar posts
      let filteredPosts = postsData.content || [];
      if (filter === 'PENDING') {
        filteredPosts = filteredPosts.filter(post => post.approvalStatus === 'PENDING');
      } else if (filter === 'APPROVED') {
        filteredPosts = filteredPosts.filter(post =>
          post.approvalStatus === 'APPROVED' || post.approvalStatus === 'AUTO_APPROVED'
        );
      } else if (filter === 'REJECTED') {
        filteredPosts = filteredPosts.filter(post => post.approvalStatus === 'REJECTED');
      } else if (filter === 'AUTO_APPROVED') {
        filteredPosts = filteredPosts.filter(post => post.approvalStatus === 'AUTO_APPROVED');
      }

      //Procesar reposts
      let filteredReposts = repostsData.content || [];
      if (filter === 'PENDING') {
        filteredReposts = filteredReposts.filter(repost => repost.approvalStatus === 'PENDING');
      } else if (filter === 'APPROVED') {
        filteredReposts = filteredReposts.filter(repost =>
          repost.approvalStatus === 'APPROVED' || repost.approvalStatus === 'AUTO_APPROVED'
        );
      } else if (filter === 'REJECTED') {
        filteredReposts = filteredReposts.filter(repost => repost.approvalStatus === 'REJECTED');
      } else if (filter === 'AUTO_APPROVED') {
        filteredReposts = filteredReposts.filter(repost => repost.approvalStatus === 'AUTO_APPROVED');
      }

      //Actualizar contadores con datos filtrados
      setCounts({
        posts: filteredPosts.length,
        reposts: filteredReposts.length
      });

      //Establecer datos filtrados según la pestaña activa
      if (activeTab === 'posts') {
        setPosts(filteredPosts);
      } else {
        setReposts(filteredReposts);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'PENDING': return 'Pendientes';
      case 'APPROVED': return 'Aprobados';
      default: return 'Todos';
    }
  };

  const getTabLabel = () => {
    return activeTab === 'posts' ? 'Publicaciones' : 'Respuestas';
  };

  const togglePostReplies = async (postId) => {
    const newExpandedPosts = new Set(expandedPosts);

    if (expandedPosts.has(postId)) {
      //Contraer
      newExpandedPosts.delete(postId);
      setExpandedPosts(newExpandedPosts);
    } else {
      //Expandir y cargar respuestas
      newExpandedPosts.add(postId);
      setExpandedPosts(newExpandedPosts);

      //Cargar respuestas si no están cargadas
      if (!postReplies.has(postId)) {
        try {
          const repliesData = await moderatorRePostService.getRepostsByPostId(postId);
          const newPostReplies = new Map(postReplies);
          newPostReplies.set(postId, repliesData.content || []);
          setPostReplies(newPostReplies);
        } catch (error) {
          console.error('Error cargando respuestas:', error);
        }
      }
    }
  };

  const handleItemUpdate = async (action, itemId) => {
    if (action === 'repost_deleted') {
      //Remover la respuesta eliminada de todas las conversaciones expandidas
      const newPostReplies = new Map(postReplies);
      for (const [postId, replies] of newPostReplies) {
        const filteredReplies = replies.filter(reply => reply.id !== itemId);
        if (filteredReplies.length !== replies.length) {
          newPostReplies.set(postId, filteredReplies);
          //También actualizar el replyCount del post correspondiente
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === postId
                ? { ...post, replyCount: Math.max(0, (post.replyCount || 0) - 1) }
                : post
            )
          );
        }
      }
      setPostReplies(newPostReplies);
    } else {
      //Para otras acciones, recargar los datos
      await loadData();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-dark-bg-primary' : 'bg-light-bg-primary'
    }`}>
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header con navegación */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/administrator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isDarkMode
                  ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-primary'
                  : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary hover:bg-light-bg-primary'
              } border`}
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                Gestión de {getTabLabel()}
              </h1>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                {getFilterLabel()} - Panel de moderación
              </p>
            </div>
          </div>

          {/* Botón de recargar */}
          <button
            onClick={loadData}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isDarkMode
                ? 'bg-dark-bg-tertiary border-dark-border-primary text-dark-text-primary hover:bg-dark-bg-primary'
                : 'bg-light-bg-tertiary border-light-border-primary text-light-text-primary hover:bg-light-bg-primary'
            } border disabled:opacity-50`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Recargar
          </button>
        </div>

        {/* Filtros y pestañas */}
        <div className={`rounded-lg p-6 mb-6 ${
          isDarkMode
            ? 'bg-dark-bg-secondary border border-dark-border-primary'
            : 'bg-light-bg-secondary border border-light-border-primary'
        }`}>
          {/* Pestañas */}
          <div className="flex gap-1 mb-4">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'posts'
                  ? (isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white')
                  : (isDarkMode
                      ? 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                      : 'text-light-text-secondary hover:bg-light-bg-tertiary')
              }`}
            >
              Publicaciones ({counts.posts})
            </button>
            <button
              onClick={() => setActiveTab('reposts')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'reposts'
                  ? (isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white')
                  : (isDarkMode
                      ? 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                      : 'text-light-text-secondary hover:bg-light-bg-tertiary')
              }`}
            >
              Respuestas ({counts.reposts})
            </button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4">
            <Filter size={16} className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'} />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  filter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : (isDarkMode
                        ? 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                        : 'text-light-text-secondary hover:bg-light-bg-tertiary')
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  filter === 'PENDING'
                    ? 'bg-yellow-600 text-white'
                    : (isDarkMode
                        ? 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                        : 'text-light-text-secondary hover:bg-light-bg-tertiary')
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilter('APPROVED')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  filter === 'APPROVED'
                    ? 'bg-green-600 text-white'
                    : (isDarkMode
                        ? 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                        : 'text-light-text-secondary hover:bg-light-bg-tertiary')
                }`}
              >
                Aprobados
              </button>
              <button
                onClick={() => setFilter('AUTO_APPROVED')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  filter === 'AUTO_APPROVED'
                    ? 'bg-emerald-600 text-white'
                    : (isDarkMode
                        ? 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                        : 'text-light-text-secondary hover:bg-light-bg-tertiary')
                }`}
              >
                Auto-aprobados
              </button>
              <button
                onClick={() => setFilter('REJECTED')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  filter === 'REJECTED'
                    ? 'bg-red-600 text-white'
                    : (isDarkMode
                        ? 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                        : 'text-light-text-secondary hover:bg-light-bg-tertiary')
                }`}
              >
                Rechazados
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="text-center py-12">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
              isDarkMode ? 'border-dark-text-accent' : 'border-light-text-accent'
            }`}></div>
            <p className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
              Cargando {getTabLabel().toLowerCase()}...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'posts' ? (
              posts.length === 0 ? (
                <div className={`text-center py-12 rounded-lg ${
                  isDarkMode
                    ? 'bg-dark-bg-secondary border border-dark-border-primary'
                    : 'bg-light-bg-secondary border border-light-border-primary'
                }`}>
                  <p className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
                    No hay {getFilterLabel().toLowerCase()} publicaciones
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id}>
                    <ModeratorPostItem
                      post={post}
                      onUpdate={handleItemUpdate}
                      onToggleReplies={() => togglePostReplies(post.id)}
                      isExpanded={expandedPosts.has(post.id)}
                      repliesCount={post.replyCount || 0}
                    />
                    {expandedPosts.has(post.id) && (
                      <div className="ml-8 mt-2 space-y-2">
                        {postReplies.get(post.id)?.length > 0 ? (
                          postReplies.get(post.id).map((reply) => (
                            <ModeratorRePostItem
                              key={reply.id}
                              repost={reply}
                              onUpdate={handleItemUpdate}
                            />
                          ))
                        ) : (
                          <div className={`text-center py-4 rounded-lg ${
                            isDarkMode
                              ? 'bg-dark-bg-secondary border border-dark-border-primary'
                              : 'bg-light-bg-secondary border border-light-border-primary'
                          }`}>
                            <p className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
                              No hay respuestas para esta publicación
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              reposts.length === 0 ? (
                <div className={`text-center py-12 rounded-lg ${
                  isDarkMode
                    ? 'bg-dark-bg-secondary border border-dark-border-primary'
                    : 'bg-light-bg-secondary border border-light-border-primary'
                }`}>
                  <p className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
                    No hay {getFilterLabel().toLowerCase()} respuestas
                  </p>
                </div>
              ) : (
                reposts.map((repost) => (
                  <ModeratorRePostItem key={repost.id} repost={repost} onUpdate={loadData} />
                ))
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllPostsPage;




