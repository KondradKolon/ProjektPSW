import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../AuthContext'; 
import Header from './Header';
import Footer from './Footer';
import LoginForm from './LoginForm';
import SignUpForm from './SignupForm';
import HomePage from './HomePage';
import CreateSurvey from './CreateSurvey';
import SurveyPage from './SurveyPage';
import ProfilePage from './ProfilePage';
import FilteredList from './SurveyUserList'
import AdminPanel from './AdminPanel';
import SurveyStats from './SurveyStats';
function App() {
    return (
        <Router>
            <AuthProvider>
                <Header />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/signup" element={<SignUpForm />} />
                    <Route path="/create-survey" element={<CreateSurvey />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/survey/:id" element={<SurveyPage />} />
                    <Route path="/mySurveys" element={<FilteredList />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/survey/:id/statistics" element={<SurveyStats/>} />
                </Routes>
                <Footer />
            </AuthProvider>
        </Router>
    );
}

export default App;
