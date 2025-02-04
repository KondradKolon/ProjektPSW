
import { useNavigate } from 'react-router-dom';

export default function SurveyCard({ id, title, description, rating }) {
    const navigate = useNavigate();

    const handleFillSurvey = () => {
        navigate(`/survey/${id}`); 
    };

    return (
        <div className="survey-card">
            <h3>{title}</h3>
            <p>{description}</p>
            <p>Rating: {rating}</p>
            <button onClick={handleFillSurvey}>Wypełnij ankietę</button>
        </div>
    );
}

