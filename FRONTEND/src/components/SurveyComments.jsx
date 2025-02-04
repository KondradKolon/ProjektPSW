import React, { useEffect, useState } from 'react';
import { useAuth } from "../AuthContext"; 

function SurveyComments({ surveyId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [ws, setWs] = useState(null);
    const { user ,token} = useAuth();

    // Połączenie WebSocket
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:5000');
        socket.onopen = () => {
            console.log('Połączono z WebSocket!');
            setWs(socket); // Ustawienie WebSocket po otwarciu
        };
    
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'new-comment' && message.surveyId === surveyId) {
                setComments((prevComments) => [...prevComments, message.comment]);
            }
        };
    
        socket.onclose = () => {
            console.log('Połączenie WebSocket zamknięte');
            setTimeout(() => {
                const newSocket = new WebSocket('ws://localhost:5000', [], {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                newSocket.onopen = () => {
                    console.log('Połączono z WebSocket po próbie ponownego połączenia!');
                    setWs(newSocket);
                };
            }, 3000);
        };
    
        return () => socket.close();
    }, [surveyId]);
    
    const handleAddComment = async () => {
        try {
            const response = await fetch(`http://localhost:5000/surveys/${surveyId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment, author_id: user.id }),
                credentials: 'include', // Dodaj to jeśli używasz ciasteczek
            });

            const data = await response.json();
            setNewComment(''); // Reset inputu
        } catch (error) {
            console.error('Błąd dodawania komentarza:', error);
        }
    };

    return (
        <div>
            <h2>Komentarze</h2>
            <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Dodaj komentarz..."
            />
            <button onClick={handleAddComment}>Dodaj</button>

            <ul>
                {comments.map((comment, index) => (
                    <li key={index}>{comment.content}</li>
                ))}
            </ul>
        </div>
    );
}

export default SurveyComments;
