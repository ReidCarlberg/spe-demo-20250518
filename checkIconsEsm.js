// Check available icons
import * as icons from '@fluentui/react-icons';

const pdfRelated = Object.keys(icons).filter(key => 
  key.toLowerCase().includes('pdf') || 
  key.toLowerCase().includes('document') ||
  key.toLowerCase().includes('file')
);

console.log('PDF-related icons:', pdfRelated);
