import React, { useState, useEffect, useRef } from 'react';
import Logo2 from '../assets/Logo2.png';
import menu from '../assets/menu.png';
import user from '../assets/user.png';
import '../styles/Header.css';

function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserOpen, setUserOpen] = useState(false);
  const menuRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      {/* Menu Icon and Dropdown */}
      <div className="menu" ref={menuRef} onClick={() => setMenuOpen(!isMenuOpen)}>
        <img src={menu} alt="menu" />
        {isMenuOpen && (
          <div className="dropdown">
            <ul>
              <li>Home</li>
              <li>About</li>
              <li>Surveys</li>
            </ul>
          </div>
        )}
      </div>

      <div className="logo">
        <img src={Logo2} alt="logo" />
      </div>

      <div className="user" ref={userRef} onClick={() => setUserOpen(!isUserOpen)}>
        <img src={user} alt="user" />
        {isUserOpen && (
          <div className="dropdown">
            <ul>
              <li>My Profile</li>
              <li>My Surveys</li>
              <li>Login</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;