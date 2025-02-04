import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import SurveyList from './SurveyList';

const HomePage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const isLoggedIn = !!user && !!token; // Sprawdzenie, czy użytkownik jest zalogowany
    const handleCreateSurveyClick = () => {
        if (isLoggedIn) {
            navigate('/create-survey'); 
        } else {
            alert("Musisz być zalogowany, aby tworzyć ankiety!");
        }
    };

    return (
        <div>
            <SurveyList />
            <button onClick={handleCreateSurveyClick}>Stwórz Ankietę</button>
        </div>
    );
};

export default HomePage;
