import { getFileUrl, isImageFile, isVideoFile } from '../../utils/fileUtils';
import { Download, FileIcon } from 'lucide-react';

const CenteredMedia = ({ fileUrl, fileType, alt = "Media" }) => {
  if (!fileUrl) return null;
  
  const fullUrl = getFileUrl(fileUrl);
  const actualFileType = fileType || getFileTypeFromName(fileUrl);
  
  const isImage = isImageFile(fileUrl) || actualFileType?.includes('image');
  const isVideo = isVideoFile(fileUrl) || actualFileType?.includes('video');
  
  return (
    <div className="flex justify-center my-6">
      <div className="max-w-full w-full">
        {isImage ? (
          <div className="relative group">
            <div className="overflow-hidden rounded-xl border-2 border-border-primary">
              <img 
                src={fullUrl} 
                alt={alt}
                className="max-h-[500px] w-auto mx-auto object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23161b22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%238b949e" font-family="Arial" font-size="16">Imagen no disponible</text></svg>';
                }}
              />
            </div>
            <a
              href={fullUrl}
              download
              className="absolute bottom-4 right-4 bg-background-primary/90 text-text-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background-secondary"
            >
              <Download size={16} />
              Descargar
            </a>
          </div>
        ) : isVideo ? (
          <div className="relative rounded-xl overflow-hidden border-2 border-border-primary">
            <video
              controls
              className="max-h-[500px] w-auto mx-auto"
            >
              <source src={fullUrl} type="video/mp4" />
              Tu navegador no soporta video HTML5.
            </video>
          </div>
        ) : fileUrl ? (
          <div className="text-center p-6 bg-background-tertiary rounded-xl border border-border-primary">
            <div className="mb-3">
              <FileIcon className="w-12 h-12 mx-auto text-text-secondary" />
            </div>
            <a
              href={fullUrl}
              download
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              Descargar archivo
            </a>
            <p className="text-text-secondary text-sm mt-2">
              {fileUrl.split('/').pop()}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const getFileTypeFromName = (fileName) => {
  if (!fileName) return null;
  const ext = fileName.toLowerCase().split('.').pop();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
  return 'file';
};

export default CenteredMedia;