import React, { useState, useEffect } from 'react'; 
import { useParams } from 'react-router-dom';
import { useAuth } from "../AuthContext"; // Importujemy useAuth
import { useNavigate } from "react-router-dom";
function SurveyPage() {
    const { id } = useParams(); // Pobieramy ID ankiety z URL
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]); // Stan do przechowywania pytań
    const [answers, setAnswers] = useState({});
    const { user, token } = useAuth()
    const navigate = useNavigate()
    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                // pobieranie ankiety
                const surveyResponse = await fetch(`http://127.0.0.1:5000/surveys/${id}`);
                const surveyData = await surveyResponse.json();
                setSurvey(surveyData);
    
                // pobieranie zapytan z ankiety
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

    const handleSubmit = async () => {
        if (!user || !token) {
            alert('Nie jesteś zalogowany!');
            return;
        }
    
        try {
            const response = await fetch('http://127.0.0.1:5000/answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    surveyId: id,
                    answers: answers,
                    userId: user.id, 
                }),
            });
    
            if (response.ok) {
                alert('Dziękujemy za wypełnienie ankiety!');
                navigate(`/`)
            } else {
                alert('Wystąpił problem przy zapisywaniu odpowiedzi.');
            }
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
                    value={answers[question.id] || 5} // Default 5
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    step="1"
                />
                <span>{answers[question.id] || 5}</span> {/* Pokazuje aktualną wartość */}
            </div>
        )}
    </div>
))}
<button onClick={handleSubmit}>Zapisz odpowiedzi</button>
        </div>
    );
}

export default SurveyPage;