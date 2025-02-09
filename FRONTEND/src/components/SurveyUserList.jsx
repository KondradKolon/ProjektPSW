import { useEffect, useState } from "react";
import SurveyCard from "./SurveyCard";
import { useAuth } from "../AuthContext";
import { Link} from 'react-router-dom';
const URL = "http://127.0.0.1:5000/surveys";

export default function FilteredList() {
    const [surveyList, setSurveyList] = useState([]);
    const [loading, setLoading] = useState(true);  
    const { user } = useAuth(); 
    
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
                        <>
                            
                            <SurveyCard
                                key={survey.id}
                                id={survey.id}
                                title={survey.title}
                                description={survey.description}
                                rating={survey.rating}
                            />
                            <button className="Edit-button" onClick={ ()=> console.log("xd")}>Edit Survey</button>
                            <button className="Delete-button" onClick={handleSurveyDelete}>Delete</button>
                            <button className="Stats-button" onClick={handleSurveyDelete}>Answer's</button>
                            <Link to={`/survey/${survey.id}/statistics`}>
                            <button>Statistics</button>
                            </Link>
                        </>
                       
                        
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
