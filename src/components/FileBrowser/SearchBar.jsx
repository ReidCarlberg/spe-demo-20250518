import React from 'react';
import { Input, Button } from '@fluentui/react-components';
import { Search24Regular, Dismiss24Regular } from '@fluentui/react-icons';

const SearchBar = ({ 
  searchTerm, 
  onSearchTermChange, 
  onSearch, 
  onClear, 
  hasResults, 
  isSearching 
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="po-search-area" style={{ marginTop: 12 }}>
      <div className="po-toolbar">
        <Input
          size="large"
          placeholder="Search files in this folder…"
          value={searchTerm}
          onChange={(_, data) => onSearchTermChange(data.value)}
          onKeyDown={handleKeyDown}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button 
            appearance="primary" 
            size="large" 
            icon={<Search24Regular />} 
            onClick={onSearch}
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          {hasResults && (
            <Button 
              appearance="secondary" 
              size="large" 
              icon={<Dismiss24Regular />} 
              onClick={onClear}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
