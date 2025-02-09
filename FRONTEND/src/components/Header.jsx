import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Logo2 from '../assets/Logo2.png';
import menu from '../assets/menu.png';
import user1 from '../assets/user.png';
import '../styles/Header.css';
import SearchBar from './SearchBar';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserOpen, setUserOpen] = useState(false);
  const menuRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    document.cookie = 'token=; path=/; max-age=0'; // Clear token
    localStorage.removeItem('user');
  };

  const handleProtectedNavigation = (path) => {
    if (!user) {
      alert('You need to log in first!');
    } else {
      navigate(path);
    }
  };

  return (
    <header className="header">
      <div className="menu" ref={menuRef} onClick={() => setMenuOpen(!isMenuOpen)}>
        <img src={menu} alt="menu" />
        {isMenuOpen && (
          <div className="dropdown">
            <ul>
              <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
              <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li> {/* dont use but could in the future*/}
              <li><Link to="/surveys" onClick={() => setMenuOpen(false)}>Surveys</Link></li> {/* dont use but could in the future*/}
            </ul>
          </div>
        )}
      </div>

      <div className="logo">
        <img src={Logo2} alt="logo" />
      </div>
      <SearchBar />
      
      <div className="user" ref={userRef} onClick={() => setUserOpen(!isUserOpen)}>
        <img src={user1} alt="user" />
        {isUserOpen && (
          <div className="dropdown">
            <ul>
              <li onClick={() => handleProtectedNavigation('/profile')}>My Profile</li>
              <li onClick={() => handleProtectedNavigation('/mySurveys')}>My Surveys</li>
              {user ? (
                <li onClick={handleLogout}>Logout</li>
              ) : (
                <li><Link to="/login" onClick={() => setUserOpen(false)}>Login</Link></li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
