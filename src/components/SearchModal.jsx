import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/search-modal.css';

const SearchModal = () => {
  const navigate = useNavigate();
  
  const handleSearchClick = (e) => {
    e.preventDefault();
    navigate('/search');
  };
  
  return (
    <div className="search-component">
      <Link
        className="nav-link"
        onClick={handleSearchClick}
        to="/search"
      >
        Search
      </Link>
    </div>
  );
};

export default SearchModal;
