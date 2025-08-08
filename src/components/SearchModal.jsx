import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/search-modal.css';
import { Button } from '@fluentui/react-components';

const SearchModal = () => {
  const navigate = useNavigate();
  
  const handleSearchClick = (e) => {
    e.preventDefault();
    navigate('/search');
  };
  
  return (
    <div className="search-component">
      <Button appearance="transparent" onClick={handleSearchClick}>
        Search
      </Button>
    </div>
  );
};

export default SearchModal;
