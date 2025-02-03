import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./Header";
import RatingCard from "./RatingCard";
import Footer from "./Footer";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignupForm";
import SurveyList from "./SurveyList"
import CreateSurvey from './CreateSurvey';
function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={
                    <>
                        <RatingCard question="Jak się dzisiaj czujesz?" />
                        <SurveyList/>
                        <CreateSurvey/>
                    </>
                } />

                <Route path="/login" element={<LoginForm />} />

                <Route path="/signup" element={<SignUpForm />} />

            </Routes>
            <Footer />
        </Router>
    );
}

export default App;