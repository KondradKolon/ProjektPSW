import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Timeout to wait for user data to load
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!user || user.role !== 'admin') {
                navigate('/');
                setLoading(false); 
                return;
            }

            const fetchUsers = async () => {
                try {
                    const response = await fetch('http://127.0.0.1:5000/users', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Błąd pobierania użytkowników');
                    }

                    const data = await response.json();
                    setUsers(data);
                    setLoading(false); // Set loading to false once users are fetched
                } catch (error) {
                    console.error(error);
                    setLoading(false); 
                }
            };

            fetchUsers();
        }, 1000); // Timeout for 1 second to allow the user data to load

        return () => clearTimeout(timeoutId); 
    }, [user, token, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Changing user role
    const handleRoleChange = async (userId, newRole) => {
        const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ role: newRole }),
        });

        if (response.ok) {
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.id === userId ? { ...u, role: newRole } : u
                )
            );
        } else {
            alert('Nie udało się zmienić roli.');
        }
    };

    // Updating user's name and surname
    const handleNameChange = async (userId, newName) => {
        const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name: newName }),
        });

        if (response.ok) {
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.id === userId ? { ...u, name: newName } : u
                )
            );
        } else {
            alert('Nie udało się zmienić imienia.');
        }
    };
    const handleEmailChange = async (userId, Email) => {
        const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ email: Email }),
        });

        if (response.ok) {
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.id === userId ? { ...u, email: Email } : u
                )
            );
        } else {
            alert('Nie udało się zmienić imienia.');
        }
    };

    // Deleting user
    const handleDeleteUser = async (userID) => {
        console.log(userID);
        const confirmDelete = window.confirm("Na pewno chcesz usunąć konto?");
        if (confirmDelete) {
            try {
                console.log(token)
                const response = await fetch(`http://127.0.0.1:5000/users/${userID}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                console.log(response)
                if (response.ok) {
                    alert("Konto zostało usunięte."); 
                } else {
                    alert("Nie udało się usunąć konta.");
                }
            } catch (error) {
                console.error("Błąd usuwania konta:", error);
            }
        }
    };

    return (
        <div>
            <h1>Admin Panel ⚙️</h1>
            <table>
                <thead>
                    <tr>
                        <th>Imię</th>
                        <th>Email</th>
                        <th>Rola</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>
                                <input
                                    type="text"
                                    value={user.name}
                                    onChange={(e) =>
                                        handleNameChange(user.id, e.target.value)
                                    }
                                />
                            </td>
                            <td>
                            <input
                                    type="text"
                                    value={user.email}
                                    onChange={(e) =>
                                        handleEmailChange(user.id, e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <select
                                    value={user.role}
                                    onChange={(e) =>
                                        handleRoleChange(user.id, e.target.value)
                                    }
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td>
                                <button onClick={() => handleDeleteUser(user.id)}>
                                    Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;
