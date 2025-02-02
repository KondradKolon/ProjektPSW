import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo2 from '../assets/Logo2.png';
import menu from '../assets/menu.png';
import user from '../assets/user.png';
import '../styles/Header.css';

function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserOpen, setUserOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
        setUserOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (dropdownType) => {
    if (dropdownType === 'menu') {
      setMenuOpen(!isMenuOpen);
      setUserOpen(false);
    } else if (dropdownType === 'user') {
      setUserOpen(!isUserOpen);
      setMenuOpen(false);
    }
  };

  return (
    <header className="header">
      {/* Menu Icon and Dropdown */}
      <div className="menu" ref={dropdownRef} onClick={() => toggleDropdown('menu')}>
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

      <div className="user" ref={dropdownRef} onClick={() => toggleDropdown('user')}>
        <img src={user} alt="user" />
        {isUserOpen && (
          <div className="dropdown">
            <ul>
              <li><Link to="/profile" onClick={() => setUserOpen(false)}>My Profile</Link></li>
              <li><Link to="/surveys" onClick={() => setUserOpen(false)}>My Surveys</Link></li>
              <li onClick={() => { navigate('/login'); setUserOpen(false); }}>Login</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;