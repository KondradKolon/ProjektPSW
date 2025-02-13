
import { useNavigate } from 'react-router-dom';
import '../styles/SurveyCard.css';
export default function SurveyCard({ id, title, description, rating }) {
    const navigate = useNavigate();

    const handleFillSurvey = () => {
        navigate(`/survey/${id}`); 
    };

    return (
        <div className="SurveyCard">
            <h3>{title}</h3>
            <p>{description}</p>
            <p>Rating: {rating.toFixed(1)}</p>
            <button onClick={handleFillSurvey}>Wypełnij ankietę</button>
        </div>
    );
}

