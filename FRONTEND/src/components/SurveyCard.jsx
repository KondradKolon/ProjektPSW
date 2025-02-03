export default function SurveyCard(props) {
    return(
        <div className="SurveyCard">
            <h1>{props.title}</h1>
            <p>{props.description}</p>
        </div>
    )
}