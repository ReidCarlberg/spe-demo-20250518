import { useState } from 'react';
import { speService } from '../../services';

export const useSearch = (containerId) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (term = searchTerm) => {
    const searchQuery = term?.trim();
    if (!searchQuery) {
      setSearchResults(null);
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const results = await speService.searchFiles(containerId, searchQuery, 100);
      setSearchResults(results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearchTerm('');
    setError(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    searchResults,
    error,
    handleSearch,
    clearSearch
  };
};
