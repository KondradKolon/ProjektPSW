import { useEffect, useState } from "react";
import SurveyCard from "./SurveyCard";
import { useAuth } from "../AuthContext";
import { Link} from 'react-router-dom';
const URL = "http://127.0.0.1:5000/surveys";
import Button from '@mui/material/Button'; 
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import BarChartIcon from '@mui/icons-material/BarChart';
import '../styles/SurveyUserList.css';
export default function FilteredList() {
    const [surveyList, setSurveyList] = useState([]);
    const [loading, setLoading] = useState(true);  
    const { user } = useAuth(); 
    //pobieranie danych
    useEffect(() => {
        if (!user) return; 

        const fetchLists = async () => {
            try {
                const response = await fetch(URL);
                const surveyList = await response.json();
                console.log("Fetched Surveys:", surveyList);

                const filteredSurveys = surveyList.filter(survey => survey.author_id === user.id);
                setSurveyList(filteredSurveys);
            } catch (error) {
                console.error("Error fetching surveys:", error);
            } finally {
                setLoading(false);  
            }
        };

        fetchLists();
    }, [user]); 

    


    const handleSurveyDelete = async () => {
        const confirmDelete = window.confirm("Na pewno chcesz usunąć ankiete?");
        if (confirmDelete) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/survey/${survey.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (response.ok) {
                    alert("Ankieta została usunięta zostało."); 
                } else {
                    alert("Nie udało się usunąć ankiety.");
                }
            } catch (error) {
                console.error("Błąd usuwania ankiety:", error);
            }
        }
    };
    



    if (!user) return <p>Loading user...</p>;
    if (loading) return <p>Loading surveys...</p>;  

    return (
        <>
        <div className="SurveyList">
            
            <h1>{user.name}'s surveys:</h1> 
            <ul>
            {surveyList.length > 0 ? (
                    surveyList.map((survey) => (
                        <div key={survey.id} className="survey-item">
                            <SurveyCard
                                key={survey.id}
                                id={survey.id}
                                title={survey.title}
                                description={survey.description}
                                rating={survey.rating}
                            />
                            <div className="button-container">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<EditIcon />}
                                    onClick={() => console.log("Edit clicked")}
                                    sx={{ marginRight: '10px' }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error" 
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleSurveyDelete(survey.id)}
                                    sx={{ marginRight: '10px' }}
                                >
                                    Delete
                                </Button>
                                <Link to={`/survey/${survey.id}/statistics`} style={{ textDecoration: 'none' }}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<BarChartIcon />}
                                    >
                                        Statistics
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No surveys found.</p>
                )}
            </ul>


            <div className="completed-surveys">
                <h1>{user.name}'s completed Surveys</h1>
            </div>
        </div>
        </>
    );
}
