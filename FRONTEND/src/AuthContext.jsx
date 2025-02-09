import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            const tokenFromCookie = document.cookie.replace(
                /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
                '$1'
            );
            console.log('Token z ciasteczka (po 1s):', tokenFromCookie);
            const userFromLocalStorage = JSON.parse(localStorage.getItem('user')) || null;
    
            if (tokenFromCookie && userFromLocalStorage) {
                setUser(userFromLocalStorage);
                setToken(tokenFromCookie);
            } else {
                setUser(null);
                setToken(null);
            }
        }, 0);
    }, []); // Tylko przy pierwszym renderowaniu komponentu
    
    const login = (userData, token) => {
        document.cookie = `token=${token}; path=/; max-age=3600`; // Set token cookie
        localStorage.setItem('user', JSON.stringify(userData)); // Store user data
        setUser(userData);
        setToken(token);
        navigate('/'); // Redirect to home page after login
    };

    const logout = () => {
        document.cookie = 'token=; path=/; max-age=0'; // Clear token
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        navigate('/'); // Redirect to home
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
