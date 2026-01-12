import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Calendar } from 'lucide-react';
import CenteredMedia from '../ui/CenteredMedia';

const PostItem = ({ post }) => {
  const location = useLocation();
  const isThreadPage = location.pathname.startsWith('/thread/');
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card p-5 mb-4 transition-transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-text-primary">{post.title}</h3>
        <span className="bg-background-tertiary text-text-secondary text-xs px-3 py-1 rounded-full border border-border-primary">
          {post.section?.name || 'General'}
        </span>
      </div>

      <p className="text-text-primary mb-4 whitespace-pre-wrap">{post.content}</p>
      
      {/*Media centrada*/}
      <CenteredMedia 
        fileUrl={post.fileUrl} 
        fileType={post.fileType}
        fileName={post.fileUrl}
        alt={post.title} 
      />

      <div className="flex items-center justify-between text-sm pt-4 border-t border-border-primary">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-text-secondary">
          <span className="flex items-center">
            <MessageSquare size={14} className="mr-1 flex-shrink-0" />
            {post.replyCount || 0} respuesta{post.replyCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center">
            <Calendar size={14} className="mr-1 flex-shrink-0" />
            {formatDate(post.createdDate)}
          </span>
        </div>
        
        {!isThreadPage && (
          <div className="flex space-x-3">
            <Link
              to={`/thread/${post.id}`}
              className="text-text-accent hover:text-blue-400 font-medium px-3 py-1 rounded hover:bg-background-tertiary transition-colors"
            >
              Ver hilo ({post.replyCount || 0})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostItem;