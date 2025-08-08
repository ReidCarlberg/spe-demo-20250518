import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import SearchModal from './SearchModal';
import { Button } from '@fluentui/react-components';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { appName } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const go = (path) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <nav className="app-navbar">
      <div className="nav-left">
        <Button appearance="transparent" onClick={() => go('/') } className="brand" aria-label="Home">
          {appName}
        </Button>
      </div>

      <Button appearance="transparent" className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle navigation">
        <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
      </Button>

      <ul className={`nav-items ${showMobileMenu ? 'show' : ''}`}>
        <li>
          <Button appearance="transparent" className={location.pathname === '/' ? 'active' : ''} onClick={() => go('/') }>
            Home
          </Button>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <Button appearance="transparent" className={location.pathname === '/spe-explore' ? 'active' : ''} onClick={() => go('/spe-explore')}>
                Documents
              </Button>
            </li>
            <li>
              <SearchModal />
            </li>
            <li>
              <Button appearance="transparent" className={location.pathname === '/agent' ? 'active' : ''} onClick={() => go('/agent')}>
                Agent
              </Button>
            </li>
          </>
        ) : null}
      </ul>

      <div className="nav-actions">
        {isAuthenticated ? (
          <Button appearance="primary" onClick={handleLogout}>Logout</Button>
        ) : (
          <Button appearance="primary" onClick={() => go('/login')}>
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
