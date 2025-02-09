import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import ChatWindow from './Czat';

function SurveyPage() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [rating, setRating] = useState(50); // default rating 50
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const surveyResponse = await fetch(`http://127.0.0.1:5000/surveys/${id}`);
                const surveyData = await surveyResponse.json();
                setSurvey(surveyData);

                const questionsResponse = await fetch(`http://127.0.0.1:5000/questions?survey_id=${id}`);
                const questionsData = await questionsResponse.json();
                setQuestions(questionsData);
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }
        };

        fetchSurvey();
    }, [id]);

    const handleAnswerChange = (questionId, answer) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: answer,
        }));
    };


//rating

    const handleRatingChange = (event) => {
        const value = Math.max(0, Math.min(100, event.target.value));
        setRating(value);
    };

    const handleSubmit = async () => {
        // Walidacja - wszystkie pytania muszą być wypełnione
        for (const question of questions) {
            if (!answers[question.id]) {
                alert(`Proszę odpowiedzieć na pytanie: ${question.question_text}`);
                return;
            }
        }
    
        try {
            // First POST request: Submitting answers
            const answersResponse = await fetch('http://127.0.0.1:5000/answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    surveyId: id,
                    answers: answers,
                    userId: user && token ? user.id : null, // null if not logged in
                }),
            });
    
            if (!answersResponse.ok) {
                alert('Wystąpił problem przy zapisywaniu odpowiedzi.');
                return;
            }
    
            // Second POST request: Updating the survey rating (only if logged in)
            if (rating !== null && user && token) {
                const ratingResponse = await fetch('http://127.0.0.1:5000/update-survey-rating', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        surveyId: id,
                        rating: parseFloat(rating),
                    }),
                });
    
                if (ratingResponse.ok) {
                    alert('Dziękujemy za wypełnienie ankiety i ocenę!');
                } else {
                    alert('Wystąpił problem przy zapisywaniu oceny ankiety.');
                    return;
                }
            }
    
            alert('Dziękujemy za wypełnienie ankiety!');
            navigate(`/`);
        } catch (error) {
            console.error('Błąd zapisywania odpowiedzi:', error);
        }
    };
    

    if (!survey || questions.length === 0) {
        return <div>Ładowanie ankiety...</div>;
    }

    return (
        <div>
            <h1>{survey.title}</h1>
            <p>{survey.description}</p>

            {questions && questions.length > 0 && questions.map((question) => (
                <div key={question.id}>
                    <h3>{question.question_text}</h3>
                    {question.question_type === 'text' && (
                        <input
                            type="text"
                            value={answers[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Twoja odpowiedź"
                        />
                    )}
                    {question.question_type === 'options' && question.options && (
                        <div>
                            {question.options.map((option, index) => (
                                <div key={index}>
                                    <input
                                        type="radio"
                                        name={question.id}
                                        value={option}
                                        checked={answers[question.id] === option}
                                        onChange={() => handleAnswerChange(question.id, option)}
                                    />
                                    {option}
                                </div>
                            ))}
                        </div>
                    )}
                    {question.question_type === 'scale' && (
                        <div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={answers[question.id] || 5}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                step="1"
                            />
                            <span>{answers[question.id] || 5}</span>
                        </div>
                    )}
                </div>
            ))}

            {/* Rating input for the survey */}
            <div>
                <h3>Ocena ankiety</h3>
                <input
                    type="text"
                    value={rating}
                    onChange={handleRatingChange}
                    placeholder="Wprowadź ocenę od 1 do 100"
                />
                <span>{rating}</span> 
            </div>

            <button onClick={handleSubmit}>Zapisz odpowiedzi</button>
            <h1>komentarze</h1>
            <ChatWindow />
        </div>
    );
}

export default SurveyPage;
