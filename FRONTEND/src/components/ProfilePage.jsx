import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext'; 
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';
const ProfilePage = () => {
    const { user, token } = useAuth(); 
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedName, setUpdatedName] = useState('');
    const [updatedEmail, setUpdatedEmail] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/users/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    }
                });

                if (!response.ok) {
                    throw new Error('Błąd pobierania danych użytkownika');
                }

                const data = await response.json();
                setUserData(data);
                setUpdatedName(data.name);
                setUpdatedEmail(data.email);
            } catch (error) {
                console.error(error);
            }
        };

        if (user && token) {
            fetchUserData();
        }
    }, [user, token]);

    const handleEditClick = () => {
        setIsEditing(true); 
    };

    const handleDeleteClick = async () => {
        const confirmDelete = window.confirm("Na pewno chcesz usunąć konto?");
        
        if (confirmDelete) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/users/${user.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (response.ok) {
                    alert("Konto zostało usunięte.");
                    navigate('/login'); 
                } else {
                    alert("Nie udało się usunąć konta.");
                }
            } catch (error) {
                console.error("Błąd usuwania konta:", error);
            }
        }
    };

    const handleSaveChanges = async () => {
        const response = await fetch(`http://127.0.0.1:5000/users/${user.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: updatedName,
                email: updatedEmail,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            setUserData(data); 
            setIsEditing(false); 
        } else {
            alert("Nie udało się zaktualizować danych.");
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false); 
        setUpdatedName(userData.name);
        setUpdatedEmail(userData.email);
    };

    if (!userData) {
        return <div>Ładowanie danych...</div>;
    }

    return (
        <div className="profile-page">
            <h1>Profil użytkownika</h1>
            {isEditing ? (
                <div>
                    <input 
                        type="text" 
                        value={updatedName} 
                        onChange={(e) => setUpdatedName(e.target.value)} 
                    />
                    <input 
                        type="email" 
                        value={updatedEmail} 
                        onChange={(e) => setUpdatedEmail(e.target.value)} 
                    />
                    <button onClick={handleSaveChanges}>Zapisz zmiany</button>
                    <button onClick={handleCancelEdit}>Anuluj</button>
                </div>
            ) : (
                <div>
                    <p>Imię: {userData.name}</p>
                    <p>Email: {userData.email}</p>
                    <button onClick={handleEditClick}>Edytuj</button>
                    <button onClick={handleDeleteClick}>Usuń konto</button>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
