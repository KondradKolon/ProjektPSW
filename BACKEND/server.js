// server.js
import express from 'express';
import bodyParser from 'body-parser';
import { Survey } from './models/survey.js'; 
import User from './models/user.js'; 
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

let surveys = []; // Tablica do przechowywania ankiet

let users = []; // Tablica do przechowywania użytkowników

// CRUD DLA ANKIET 

// Create - dodanie nowej ankiety
app.post('/surveys', (req, res) => {
    const { id, title, description,authorID, questions } = req.body;
    const newSurvey = new Survey(id, title, description,authorID, questions);
    surveys.push(newSurvey);
    res.status(201).json(newSurvey);
});

// Read - pobranie wszystkich ankiet
app.get('/surveys', (req, res) => {
    res.json(surveys);
});

// Read - pobranie konkretnej ankiety po ID
app.get('/surveys/:id', (req, res) => {
    const survey = surveys.find(s => s.id === parseInt(req.params.id));
    if (!survey) return res.status(404).send('Ankieta nie znaleziona.');
    res.json(survey);
});

// Update - aktualizacja ankiety po ID
app.patch('/surveys/:id', (req, res) => {
    const survey = surveys.find(s => s.id === parseInt(req.params.id));
    if (!survey) return res.status(404).send('Ankieta nie znaleziona.');

    if (req.body.title) survey.title = req.body.title;
    if (req.body.description) survey.description = req.body.description;
    if (req.body.authorID) survey.authorID = req.body.authorID;
    if (req.body.questions) survey.questions = req.body.questions;

    res.json(survey);
});

// Delete - usunięcie ankiety po ID
app.delete('/surveys/:id', (req, res) => {
    const index = surveys.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send('Ankieta nie znaleziona.');

    surveys.splice(index, 1);
    res.send('Ankieta usunięta.');
});




//CRUD DLA USERÓW

// Create - dodanie nowego użytkownika
app.post('/users', (req, res) => {
    const { id, name, email } = req.body;
    const newUser = new User(id, name, email);
    users.push(newUser);
    res.status(201).json(newUser);
});

// Read - pobranie wszystkich użytkowników
app.get('/users', (req, res) => {
    res.json(users);
});

// Read - pobranie konkretnego użytkownika po ID
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('Użytkownik nie znaleziony.');
    res.json(user);
});

// Update - aktualizacja użytkownika po ID
app.patch('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('Użytkownik nie znaleziony.');

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    res.json(user);
});

// Delete - usunięcie użytkownika po ID
app.delete('/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send('Użytkownik nie znaleziony.');

    users.splice(index, 1);
    res.send('Użytkownik usunięty.');
});


app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
