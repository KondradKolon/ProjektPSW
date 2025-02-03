import { useEffect,useState } from "react"
import SurveyCard from "./SurveyCard"
const URL='http://127.0.0.1:5000/surveys'
export default function SurveyList() {
    const [surveyList,setSurveyList] = useState([])
    
    useEffect(()=> {
        const fetchLists = async () => {
            const response = await fetch(URL)
            const surveyList = await response.json();
            setSurveyList(surveyList)
            console.log(surveyList)
        };
        fetchLists()
    },[])
    console.log("bomboclat")
    return(
        <div className='SurveyList'>
            <h1>Popular Surveys</h1>
            <ul>
                {surveyList.map((survey)=>{
                    return <SurveyCard key={survey.id} title={survey.title} description={survey.description} rating={survey.rating}/>
                })}
            </ul>

        </div>

    )
}
