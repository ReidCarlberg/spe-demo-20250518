import React from 'react';

const FileIcon = ({ type }) => {
  let iconClass = "file-icon";
  
  switch (type) {
    case 'folder':
      iconClass += " folder-icon";
      return <span className={iconClass}><i className="fas fa-folder"></i></span>;
    case 'pdf':
      iconClass += " pdf-icon";
      return <span className={iconClass}><i className="fas fa-file-pdf"></i></span>;
    case 'word':
    case 'docx':
    case 'doc':
      iconClass += " word-icon";
      return <span className={iconClass}><i className="fas fa-file-word"></i></span>;
    case 'xlsx':
    case 'xls':
      iconClass += " excel-icon";
      return <span className={iconClass}><i className="fas fa-file-excel"></i></span>;
    case 'powerpoint':
    case 'pptx':
    case 'ppt':
      iconClass += " powerpoint-icon";
      return <span className={iconClass}><i className="fas fa-file-powerpoint"></i></span>;
    case 'image':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      iconClass += " image-icon";
      return <span className={iconClass}><i className="fas fa-file-image"></i></span>;
    case 'text':
    case 'txt':
      iconClass += " text-icon";
      return <span className={iconClass}><i className="fas fa-file-alt"></i></span>;
    default:
      return <span className={iconClass}><i className="fas fa-file"></i></span>;
  }
};

export default FileIcon;
