import React, { useEffect, useReducer } from 'react';
import SurveyCard from './SurveyCard';
import '../styles/SurveyList.css';
const URL = 'http://127.0.0.1:5000/surveys';


const actionTypes = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

// handling loading errors success 
const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.LOADING:
      return { ...state, loading: true, error: null };
    case actionTypes.SUCCESS:
      return { ...state, loading: false, surveyList: action.payload };
    case actionTypes.ERROR:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function SurveyList() {
  const initialState = {
    surveyList: [],
    loading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchLists = async () => {
      dispatch({ type: actionTypes.LOADING });

      try {
        const response = await fetch(URL);
        if (!response.ok) {
          throw new Error('Failed to fetch surveys');
        }
        const surveyList = await response.json();
        dispatch({ type: actionTypes.SUCCESS, payload: surveyList });
      } catch (error) {
        dispatch({ type: actionTypes.ERROR, payload: error.message });
      }
    };

    fetchLists();
  }, []);

  if (state.loading) {
    return <div>Loading...</div>;
  }

  if (state.error) {
    return <div>Error: {state.error}</div>;
  }

  return (
    <div className="SurveyList">
        <h1 className="Title">Popular Surveys</h1>
        <div className="survey-grid">
            {state.surveyList.map((survey) => (
                <SurveyCard
                    key={survey.id}
                    id={survey.id}
                    title={survey.title}
                    description={survey.description}
                    rating={survey.rating}
                />
            ))}
        </div>
    </div>
    );
}
