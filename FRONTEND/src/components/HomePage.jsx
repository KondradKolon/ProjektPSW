import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import SurveyList from './SurveyList';
import ChatWindow from './Czat';
import Button from '@mui/material/Button';
import '../styles/Homepage.css'
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
        <div className="homepage">
            <SurveyList />
            <Button
                variant="contained" 
                color="primary" 
                onClick={handleCreateSurveyClick}
                style={{ margin: '0 auto' }} 
            >
            Create Survey
            </Button>
            <ChatWindow /> 
        </div>
    );
};

export default HomePage;
