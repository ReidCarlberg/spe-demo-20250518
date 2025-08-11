export const getFileTypeFromMime = (mimeType, name) => {
  if (!mimeType) {
    // Try to get type from extension
    const extension = name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'doc': case 'docx': return 'word';
      case 'xls': case 'xlsx': return 'excel';
      case 'ppt': case 'pptx': return 'powerpoint';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'image';
      case 'txt': return 'text';
      default: return 'file';
    }
  }
  
  if (mimeType.includes('folder')) return 'folder';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word')) return 'word';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'powerpoint';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('text')) return 'text';
  
  return 'file';
};

export const isPreviewableFile = (file) => {
  if (!file || file.folder) return false;
  
  const fileExtension = file.name?.split('.').pop()?.toLowerCase();
  const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff', 'webp'];
  
  return previewableExtensions.includes(fileExtension) || 
         (file.file?.mimeType && (
           file.file.mimeType.startsWith('image/') || 
           file.file.mimeType === 'application/pdf'
         ));
};

export const isOfficeFile = (file) => {
  if (!file || file.folder) return false;
  
  const fileExtension = file.name?.split('.').pop()?.toLowerCase();
  const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  
  return officeExtensions.includes(fileExtension) || 
         (file.file?.mimeType && (
           file.file.mimeType.includes('word') || 
           file.file.mimeType.includes('excel') || 
           file.file.mimeType.includes('powerpoint') || 
           file.file.mimeType.includes('spreadsheet') || 
           file.file.mimeType.includes('presentation')
         ));
};

export const formatFileSize = (size) => {
  if (!size) return '';
  return `${Math.round(size / 1024)} KB`;
};

export const formatFolderChildCount = (folder) => {
  if (!folder?.folder) return '';
  const count = folder.folder.childCount ?? '';
  if (count === '') return '';
  return `${count} ${count === 1 ? 'item' : 'items'}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString();
};
