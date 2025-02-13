import { useState, useEffect } from 'react';

function useFetchData(surveyId) {
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSurveyData = async () => {
            setLoading(true);
            try {
                // Fetch survey data
                const surveyResponse = await fetch(`http://127.0.0.1:5000/surveys/${surveyId}`);
                if (!surveyResponse.ok) {
                    throw new Error('Failed to fetch survey data');
                }
                const surveyData = await surveyResponse.json();
                setSurvey(surveyData);

                // Fetch questions data
                const questionsResponse = await fetch(`http://127.0.0.1:5000/questions?survey_id=${surveyId}`);
                if (!questionsResponse.ok) {
                    throw new Error('Failed to fetch questions data');
                }
                const questionsData = await questionsResponse.json();
                setQuestions(questionsData);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (surveyId) {
            fetchSurveyData();
        }
    }, [surveyId]);

    return { survey, questions, loading, error };
}

export default useFetchData;