import Counter1 from "./Counter"
import Header from "./Header"
import RatingCard from "./RatingCard"
import Footer from "./Footer"
// import CreateSurvey from "./CreateSurvey.jsx"
function App() {
  return (
    <>
      <Header/>
      <RatingCard question="Jak sie dzisiaj czujesz"/>
      <Counter1/>
      <Footer/>
    </>
    
  )
}

export default App
