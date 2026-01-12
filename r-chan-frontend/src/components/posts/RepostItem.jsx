import { Calendar, Download } from 'lucide-react';
import CenteredMedia from '../ui/CenteredMedia';

const RepostItem = ({ repost }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card p-5 mb-4 pl-4 border-l-4 border-l-blue-400 transition-transform hover:-translate-y-1">
      <p className="text-text-primary mb-4 whitespace-pre-wrap">{repost.content}</p>
      
      {/*Media centrada*/}
      <CenteredMedia 
        fileUrl={repost.fileUrl} 
        fileType={repost.fileType}
        fileName={repost.fileUrl}
        alt="Adjunto de respuesta" 
      />
      
      <div className="flex items-center justify-between text-sm pt-4 border-t border-border-primary">
        <div className="flex items-center space-x-4 text-text-secondary">
          <span className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {formatDate(repost.createdDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RepostItem;