import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Logo2 from '../assets/Logo2.png';
import menu from '../assets/menu.png';
import user1 from '../assets/user.png';
import '../styles/Header.css';
import SearchBar from './SearchBar';
export default function Header() {
  const { user,logout } = useAuth(); 
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserOpen, setUserOpen] = useState(false);
  const menuRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
  
  }, []);

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    document.cookie = 'token=; path=/; max-age=0'; //clear token and remove local storage
    localStorage.removeItem('user'); 
  };

  return (
    <header className="header">
      <div className="menu" ref={menuRef} onClick={() => setMenuOpen(!isMenuOpen)}>
        <img src={menu} alt="menu" />
        {isMenuOpen && (
          <div className="dropdown">
            <ul>
              <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
              <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
              <li><Link to="/surveys" onClick={() => setMenuOpen(false)}>Surveys</Link></li>
            </ul>
          </div>
        )}
      </div>
        
      <div className="logo">
        <img src={Logo2} alt="logo" />
      </div>
      <SearchBar/>
      <div className="user" ref={userRef} onClick={() => setUserOpen(!isUserOpen)}>
        <img src={user1} alt="user" />
        {isUserOpen && (
          <div className="dropdown">
            <ul>
              <li><Link to="/profile" onClick={() => setUserOpen(false)}>My Profile</Link></li>
              <li><Link to="/surveys" onClick={() => setUserOpen(false)}>My Surveys</Link></li>
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
