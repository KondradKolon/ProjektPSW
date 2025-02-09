import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchBar.css'; 

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        console.log(`Wysyłam zapytanie: http://localhost:5000/surveys/search?q=${searchTerm}`);

        const fetchData = async () => {
            if (!searchTerm.trim()) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://localhost:5000/surveys/search?q=${searchTerm}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Błąd wyszukiwania.');
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (err) {
                console.error("Błąd wyszukiwania:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSurveyClick = (surveyId) => {
        setSearchTerm(''); 
        setSearchResults([]); 
        navigate(`/survey/${surveyId}`);
    };

    return (
        <div className="search-bar-container">
            <input
                type="text"
                placeholder="Wyszukaj ankietę..."
                value={searchTerm}
                onChange={handleInputChange}
            />
            {loading && <p>Ładowanie wyników...</p>}
            {error && <p className="error">{error}</p>}
            {searchResults.length > 0 ? (
                <ul>
                    {searchResults.map((survey) => (
                        <li key={survey.id} onClick={() => handleSurveyClick(survey.id)}>
                            {survey.title}
                        </li>
                    ))}
                </ul>
            ) : (
                <p></p> //
            )}
        </div>
    );
}

export default SearchBar;
