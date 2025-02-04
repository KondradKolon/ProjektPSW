import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Importujemy useAuth
export default function CreateSurvey() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, token } = useAuth(); // Pobieramy dane użytkownika i token z kontekstu

    // Funkcje obsługujące pytania
    const handleQuestionTextChange = (id, text) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, text } : q));
    };

    const handleRemoveQuestion = (id) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleOptionChange = (questionId, optionIndex, value) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === questionId ? {
                    ...q,
                    options: q.options.map((opt, idx) =>
                        idx === optionIndex ? value : opt
                    )
                } : q
            )
        );
    };

    const handleAddOption = (questionId) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === questionId ? { ...q, options: [...q.options, ''] } : q
            )
        );
    };

    const handleRemoveOption = (questionId, optionIndex) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === questionId ? {
                    ...q,
                    options: q.options.filter((_, idx) => idx !== optionIndex)
                } : q
            )
        );
    };

    const handleAddQuestion = (type) => {
        const newQuestion = {
            id: Date.now(),
            type: type,
            text: '',
            options: type === 'options' ? [''] : [],
        };
        setQuestions(prev => [...prev, newQuestion]);
        setShowPopup(false); // Zamyka popup po dodaniu pytania
    };

    // Poprawiona obsługa sesji
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setLoading(false);
        }
    }, [user, navigate]);

    // Poprawione przesyłanie danych
    const handleSubmit = async () => {
        if (!user || !token) {
            alert("Nie jesteś zalogowany.");
            return;
        }
    
        try {
            // Walidacja danych
            if (!title.trim() || questions.length === 0) {
                alert('Wypełnij wszystkie wymagane pola!');
                return;
            }
            console.log({
                title: title.trim(),
                description: description.trim(),
                questions: questions
            });
    
            // Walidacja pytań z opcjami (np. upewniamy się, że opcje nie są puste)
            for (const q of questions) {
                if (q.type === 'options' && q.options.some(opt => !opt.trim())) {
                    alert('Wszystkie opcje muszą być wypełnione!');
                    return;
                }
            }
    
            const surveyResponse = await fetch('http://localhost:5000/surveys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    author_id: user.id
                })
            });
    
            if (surveyResponse.status === 401) {
                alert("Nieautoryzowany dostęp.");
                navigate('/login');
                return;
            }
    
            if (!surveyResponse.ok) {
                throw new Error('Błąd zapisywania ankiety');
            }
            
            const surveyData = await surveyResponse.json();
            console.log('Odpowiedź z backendu przy zapisie ankiety:', surveyData);
            const questionResponses = await Promise.all(
                questions.map(q => {
                    console.log(`Wysyłanie pytania: ${q.text}`);
                    return fetch('http://localhost:5000/questions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            survey_id: surveyData.id,
                            question_text: q.text.trim(),
                            question_type: q.type,
                            options: q.type === 'options' ? (q.options.filter(opt => opt.trim()).length > 0 ? q.options : []) : null
                        })
                    });
                })
            );
    
    
            // Sprawdzamy, czy odpowiedzi na pytania zostały zapisane poprawnie
            for (const response of questionResponses) {
                const responseData = await response.json();
                console.log('Odpowiedź z zapisu pytania:', responseData);
                if (!response.ok || !responseData.id) {
                    console.error('Błąd zapisywania pytania:', responseData);
                    throw new Error('Błąd zapisywania pytań');
                }
            }
    
            // Po zakończeniu, przekierowujemy użytkownika do nowej ankiety
            navigate(`/survey/${surveyData.id}`);
    
        } catch (error) {
            console.error('Submission error:', error);
            alert(error.message || 'Wystąpił błąd');
        }
    };
    if (loading) {
        return <div className="loading">Weryfikacja sesji...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="create-survey-container">
            
            
            <div className="form-section">
                <div className="input-group">
                    <label>Tytuł ankiety:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Wpisz tytuł ankiety"
                        className="title-input"
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Opis (opcjonalny):</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Dodaj opis ankiety"
                        className="description-input"
                    />
                </div>

                <div className="questions-section">
                    <h2>Lista pytań</h2>
                    
                    <div className="question-controls">
                        <button 
                            onClick={() => setShowPopup(true)}
                            className="add-question-btn"
                        >
                            + Dodaj pytanie
                        </button>
                        
                        {showPopup && (
                            <div className="question-type-modal">
                                <div 
                                    className="type-option"
                                    onClick={() => handleAddQuestion('text')}
                                >
                                    Pytanie otwarte
                                </div>
                                <div 
                                    className="type-option"
                                    onClick={() => handleAddQuestion('options')}
                                >
                                    Wielokrotny wybór
                                </div>
                                <div 
                                    className="type-option"
                                    onClick={() => handleAddQuestion('scale')}
                                >
                                    Skala 1-10
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="questions-list">
                        {questions.map((question) => (
                            <div key={question.id} className="question-card">
                                <div className="question-header">
                                    <h3>{getQuestionTypeLabel(question.type)}</h3>
                                    <button
                                        onClick={() => handleRemoveQuestion(question.id)}
                                        className="delete-question-btn"
                                    >
                                        Usuń
                                    </button>
                                </div>
                                
                                <input
                                    type="text"
                                    value={question.text}
                                    onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                                    placeholder="Treść pytania"
                                    className="question-text-input"
                                />

                                {question.type === 'options' && (
                                    <div className="options-container">
                                        {question.options.map((option, index) => (
                                            <div key={index} className="option-item">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(question.id, index, e.target.value)}
                                                    placeholder={`Opcja ${index + 1}`}
                                                    className="option-input"
                                                />
                                                <button
                                                    onClick={() => handleRemoveOption(question.id, index)}
                                                    className="remove-option-btn"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => handleAddOption(question.id)}
                                            className="add-option-btn"
                                        >
                                            + Dodaj opcję
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button 
                    onClick={handleSubmit}
                    className="submit-btn"
                >
                    Zapisz ankietę
                </button>
            </div>
        </div>
    );
}

// Funkcja pomocnicza do rozpoznawania typów pytań
const getQuestionTypeLabel = (type) => {
    const types = {
        text: 'Pytanie otwarte',
        options: 'Wielokrotny wybór',
        scale: 'Skala ocen'
    };
    return types[type] || 'Nieznany typ pytania';
};
