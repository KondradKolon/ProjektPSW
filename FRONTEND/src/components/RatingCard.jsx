import '../styles/RatingCard.css';

function RatingCard(props) {
    return(
        <div className="rating-card">
            <h1>{props.question}</h1>
            
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>
            <button>Submit</button>
        </div>
    );
}

export default RatingCard