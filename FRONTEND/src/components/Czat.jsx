import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { useAuth } from '../AuthContext';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [client, setClient] = useState(null);
  const { user, token } = useAuth();
  useEffect(() => {
    const mqttClient = mqtt.connect('wss://test.mosquitto.org:8081', {
      clientId: 'chat-client-' + Math.random().toString(16).substr(2, 8), 
      clean: true, 
      reconnectPeriod: 1000, 
    });

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT Broker');
      
      setTimeout(() => {
        mqttClient.subscribe('chat', (err) => {
          if (err) {
            console.error('Error subscribing:', err);
          } else {
            console.log('Subscribed to chat');
          }
        });
      }, 1000);
    });

    mqttClient.on('message', (topic, message) => {
    console.log('Received message:', message.toString());
      setMessages((prevMessages) => [
        ...prevMessages,
        message.toString(),
      ]);
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Client Error:', err);
    });

    mqttClient.on('close', () => {
      console.log('Connection closed');
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (client && newMessage.trim()) {
      const messageContent = newMessage.trim();
      const authorId = user.id ; 

      // Najpierw wysyłamy wiadomość do bazy danych
      const response = await fetch('http://localhost:5000/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          author_id: authorId,
        }),
      });

      if (response.ok) {
        client.publish('chat', messageContent);
        setNewMessage('');
      } else {
        console.error('Błąd przy zapisywaniu wiadomości');
      }
    }
  };

  return (
    <div
      style={{
        border: '2px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '400px',
        margin: '20px auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h3 style={{ textAlign: 'center', color: '#333' }}>Global czat</h3>
      <div style={{ marginBottom: '15px' }}>
        {messages.map((message, index) => (
          <p key={index} style={{ marginBottom: '8px', color: '#555' }}>
            {message}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Wpisz wiadomość"
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          boxSizing: 'border-box',
        }}
      />
      <button
        onClick={handleSendMessage}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Wyślij
      </button>
    </div>
  );
};

export default ChatWindow;
