import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useParams } from 'react-router-dom';
// import { Chart as ChartJS } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import '../styles/SurveyStats.css'; 

export default function SurveyStats() {
    const { id } = useParams();
    const { token } = useAuth();
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

    // Fetch survey
    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/surveys/${id}`);
                const data = await res.json();
                setSurvey(data);
            } catch (error) {
                console.error("Error fetching survey:", error);
            }
        };
        fetchSurveyData();
    }, [id]);

    // Fetch questions
    useEffect(() => {
        const fetchQuestionsData = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/questions?survey_id=${id}`);
                const data = await res.json();
                setQuestions(data);
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        };
        fetchQuestionsData();
    }, [id]);

    // Fetch answers
    useEffect(() => {
        const fetchAnswersData = async () => {
            if (questions.length === 0) return;
            try {
                const res = await fetch(`http://127.0.0.1:5000/answers?survey_id=${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                // Grupowanie odpowiedzi według pytania
                const groupedAnswers = data.reduce((acc, { user_id, question_id, answer }) => {
                    if (!acc[question_id]) acc[question_id] = [];
                    acc[question_id].push(answer);
                    return acc;
                }, {});

                setAnswers(groupedAnswers);
            } catch (error) {
                console.error("Error fetching answers:", error);
            }
        };
        fetchAnswersData();
    }, [id, token, questions]);

    // Eksport do CSV
    const exportToCSV = () => {
        const rows = [["Pytanie", "Odpowiedź", "Liczba"]];
        questions.forEach((question) => {
            const questionAnswers = answers[question.id] || [];
            const answerCounts = questionAnswers.reduce((acc, answer) => {
                acc[answer] = (acc[answer] || 0) + 1;
                return acc;
            }, {});
            Object.entries(answerCounts).forEach(([answer, count]) => {
                rows.push([question.question_text, answer, count]);
            });
        });

        const csvContent = rows.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "survey_results.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Eksport do PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Statystyki Ankiety", 10, 10);

        let y = 20;
        questions.forEach((question) => {
            doc.text(`Pytanie: ${question.question_text}`, 10, y);
            y += 10;

            const questionAnswers = answers[question.id] || [];
            const answerCounts = questionAnswers.reduce((acc, answer) => {
                acc[answer] = (acc[answer] || 0) + 1;
                return acc;
            }, {});
            Object.entries(answerCounts).forEach(([answer, count]) => {
                doc.text(`- ${answer}: ${count}`, 15, y);
                y += 10;
            });

            y += 10;
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        });

        doc.save("survey_results.pdf");
    };

    if (!survey || questions.length === 0) {
        return <p>Ładowanie danych ankiety...</p>;
    }

    return (
        <div className="survey-stats-container">
            <h2>Statystyki Ankiety {survey.title}</h2>
            <div className="export-buttons">
                <button className="csvImport" onClick={exportToCSV}>Eksportuj do CSV</button>
                <button className="pdfImport" onClick={exportToPDF}>Eksportuj do PDF</button>
            </div>
            {questions.map((question) => {
                const questionAnswers = answers[question.id] || [];
                
                // Liczymy, ile razy każda odpowiedź wystąpiła
                const answerCounts = questionAnswers.reduce((acc, answer) => {
                    acc[answer] = (acc[answer] || 0) + 1;
                    return acc;
                }, {});

                // Dane dla wykresu
                const chartData = {
                    labels: Object.keys(answerCounts), 
                    datasets: [
                        {
                            label: 'Liczba odpowiedzi',
                            data: Object.values(answerCounts), 
                            backgroundColor: 'rgba(21, 223, 71, 0.6)', 
                            borderColor: 'rgb(77, 46, 187)', 
                            borderWidth: 1,
                        },
                    ],
                };

                return (
                    <div key={question.id} className="chart-container">
                        <p>{question.question_text}</p>
                        <div className="chart-wrapper">
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false },
                                    },
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}