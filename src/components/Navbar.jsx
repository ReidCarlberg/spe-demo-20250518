import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState } from 'react';
import SearchModal from './SearchModal';
import './Navbar.css';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">SPE Demo</Link>
      
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
      </button>
      
      <ul className={`navbar-nav ${showMobileMenu ? 'show' : ''}`}>
        <li>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Home
          </Link>
        </li>        {isAuthenticated ? (
          <>
            <li>
              <Link 
                to="/spe-explore" 
                className={`nav-link ${location.pathname === '/spe-explore' ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                Documents
              </Link>
            </li>
            <li>
              <SearchModal />
            </li>
          </>
        ) : null}
      </ul>
        <div className="auth-buttons">
        {isAuthenticated ? (
          <>
            <button 
              className="button button-secondary" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link 
            to="/login" 
            className="button button-primary"
            onClick={() => setShowMobileMenu(false)}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
