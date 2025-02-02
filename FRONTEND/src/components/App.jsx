import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Counter1 from "./Counter";
import Header from "./Header";
import RatingCard from "./RatingCard";
import Footer from "./Footer";
import LoginForm from "./LoginForm"; // Dodaj ten import
import SignUpForm from "./SignupForm"; // Dodaj ten import

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={
                    <>
                        <RatingCard question="Jak się dzisiaj czujesz?" />
                        <Counter1 />
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