import React, { useState } from "react";
// import "./CreateSurvey.css";

export default function CreateSurvey() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleDescriptionChange = (e) => setDescription(e.target.value);
    const handlePlusClick = () => setShowPopup(true);
    const handleAddQuestion = (type) => {
        const newQuestion = { id: Date.now(), type, text: '' };
        setQuestions(prev => [...prev, newQuestion]);
        setShowPopup(false);
    };
    const handleQuestionTextChange = (id, text) => {
        setQuestions(prev =>
            prev.map(q => (q.id === id ? { ...q, text } : q))
        );
    };
    const handleRemoveQuestion = (id) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleSubmit = async () => {
        const surveyData = { title, description, questions };
        try {
            const response = await fetch('http://127.0.0.1:5000/surveys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData),
            });
            if (!response.ok) {
                throw new Error('Failed to create survey');
            }
            alert('Survey created successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create survey');
        }
    };

    return (
        <div className="create-survey">
            <h1>Create Survey</h1>
            <input
                type="text"
                placeholder="Enter Survey Title"
                value={title}
                onChange={handleTitleChange}
            />
            <textarea
                placeholder="Enter Survey Description"
                value={description}
                onChange={handleDescriptionChange}
            />
            <div className="question-creator">
                <button onClick={handlePlusClick}>+ Add Question</button>
                {showPopup && (
                    <div className="popup">
                        <div onClick={() => handleAddQuestion('text')}>
                            Text Question
                        </div>
                        <div onClick={() => handleAddQuestion('options')}>
                            Options Question
                        </div>
                        <div onClick={() => handleAddQuestion('scale')}>
                            Scale Question
                        </div>
                    </div>
                )}
            </div>
            <div className="questions-list">
                {questions.map((q) => (
                    <div key={q.id} className="question-card">
                        <h3>{q.type} Question</h3>
                        <input
                            type="text"
                            placeholder="Enter question text"
                            value={q.text}
                            onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                        />
                        <button onClick={() => handleRemoveQuestion(q.id)}>Remove</button>
                    </div>
                ))}
            </div>
            <button onClick={handleSubmit}>Create Survey</button>
        </div>
    );
}