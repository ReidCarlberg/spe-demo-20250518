import { useContext } from 'react';
import { DebugModeContext } from '../context/DebugModeContext';

/**
 * Custom hook to access debug mode functionality
 * @returns {Object} Debug mode context
 */
export const useDebugMode = () => {
  const context = useContext(DebugModeContext);
  
  if (!context) {
    throw new Error('useDebugMode must be used within a DebugModeProvider');
  }
  
  return context;
};
