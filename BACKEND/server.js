// server.js
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken'; // Dodaj tę linię
import cookieParser from 'cookie-parser'; // Dodaj tę linię
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
app.use(bodyParser.json());
app.use(cookieParser());




const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

import cors from 'cors';

app.use(cors({
    origin: 'http://localhost:5173', // Adres Twojego frontendu
    credentials: true, // Zezwól na ciasteczka
}));
//-------------------------------------------------------------------------------------------------------------------------------------
// CRUD DLA ANKIET 

// Create - dodanie nowej ankiety
// 
// Tworzenie ankiety
app.post('/surveys', async (req, res) => {
    const { title, description, author_id, questions } = req.body;
    try {
        // Dodanie nowej ankiety do bazy danych
        const { data: newSurvey, error } = await supabase
            .from('surveys')
            .insert([{ title, description, author_id, questions }])
            .select('*')  // Zapewnia, że zwrócimy wszystkie pola dodanego rekordu
            .single();  // Oczekujemy tylko jednej ankiety

        if (error) throw error;

        // Zwróć dane nowej ankiety
        res.status(201).json(newSurvey);
    } catch (error) {
        console.error("Błąd przy tworzeniu ankiety:", error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

// Pobranie wszystkich ankiet
app.get('/surveys', async (req, res) => {
    try {
      const { data: surveys, error } = await supabase.from('surveys').select('*');
      if (error) throw error;
  
      res.status(200).json(surveys);
    } catch (error) {
      console.error("Błąd przy pobieraniu ankiet:", error);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  });
  
// Pobranie konkretnej ankiety po ID
app.get('/surveys/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const { data: survey, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();
  
      if (error || !survey) {
        return res.status(404).json({ message: 'Ankieta nie znaleziona.' });
      }
  
      res.status(200).json(survey);
    } catch (error) {
      console.error("Błąd przy pobieraniu ankiety:", error);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  });
  
// Aktualizacja ankiety po ID
app.patch('/surveys/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, author_id, questions } = req.body;

    try {
        // Wyszukiwanie ankiety w bazie danych po ID
        const { data: survey, error } = await supabase
            .from('surveys')
            .select('*')
            .eq('id', id)
            .single(); // Oczekujemy tylko jednej ankiety

        if (error || !survey) {
            return res.status(404).json({ message: 'Ankieta nie znaleziona.' });
        }

        // Aktualizacja ankiety w bazie danych
        const { data: updatedSurvey, error: updateError } = await supabase
            .from('surveys')
            .update({ title, description, author_id, questions })
            .eq('id', id)
            .select('*') // Zapewnienie, że zwróci wszystkie zaktualizowane dane
            .single(); // Oczekujemy tylko jednej ankiety

        if (updateError) {
            return res.status(500).json({ message: 'Błąd serwera przy aktualizacji ankiety', details: updateError.message });
        }

        // Zwróć zaktualizowaną ankietę
        res.json(updatedSurvey);
    } catch (error) {
        console.error("Błąd przy aktualizacji ankiety:", error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

// Usunięcie ankiety po ID
app.delete('/surveys/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('surveys')
            .delete()
            .eq('id', id);

        // Jeśli wystąpił błąd
        if (error) {
            return res.status(500).json({ message: 'Błąd przy usuwaniu ankiety', details: error.message });
        }

        // Sprawdzenie, czy ankieta została faktycznie usunięta
        const { data } = await supabase
            .from('surveys')
            .select('*')
            .eq('id', id);

        // Jeśli ankieta nie została znaleziona po próbie usunięcia
        if (data.length === 0) {
            return res.status(200).json({ message: 'Ankieta usunięta.' });
        }


    } catch (error) {
        console.error("Błąd przy usuwaniu ankiety:", error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});
  

//-------------------------------------------------------------------------------------------------------------------------------------

//CRUD DLA USERÓW

// Endpoint rejestracji użytkownika
// Endpoint rejestracji użytkownika
app.post('/users', async (req, res) => {
    console.log("Otrzymano żądanie rejestracji:", req.body)
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Wymagane pola: name, email, password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Nieprawidłowy format emaila' });
    }

    try {
        // Sprawdzenie, czy użytkownik już istnieje
        const { data: existingUser, error: existingUserError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();  // ⬅ Zmiana na `maybeSingle()`, żeby obsłużyć brak wyniku

        if (existingUserError) {
            console.error("Błąd przy sprawdzaniu użytkownika:", existingUserError);
            return res.status(500).json({ message: 'Błąd serwera', details: existingUserError.message });
        }

        if (existingUser) {
            return res.status(400).json({ message: 'Użytkownik o tym emailu już istnieje' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Dodanie użytkownika do bazy
        const { error: insertError } = await supabase
            .from('users')
            .insert([{ name, email, password: hashedPassword }]);

        if (insertError) {
            console.error("Błąd przy dodawaniu użytkownika:", insertError);
            return res.status(500).json({ message: 'Błąd serwera', details: insertError.message });
        }

        // 🔹 Wymuszone pobranie nowo dodanego użytkownika
        const { data: newUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();  // ⬅ Pobranie 1 wyniku, który ma pasować do wstawionego

        if (fetchError || !newUser) {
            console.error("Błąd przy pobieraniu nowego użytkownika:", fetchError);
            return res.status(500).json({ message: 'Błąd serwera: nie udało się pobrać nowo dodanego użytkownika' });
        }

        console.log("✅ Nowy użytkownik:", newUser); // Debugowanie

        res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });

    } catch (error) {
        console.error("❌ Błąd w kodzie:", error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});



// Read - pobranie wszystkich użytkowników
app.get('/users', async (req, res) => {
    const { data: users, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        return res.status(500).json({ message: 'Błąd serwera', details: error.message });
    }

    res.json(users);
});

// Read - pobranie konkretnego użytkownika po ID
app.get('/users/:id', async (req, res) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error || !user) {
        return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
    }

    res.json(user);
});


// Update - aktualizacja użytkownika po ID
app.patch('/users/:id', async (req, res) => {
    const { name, email } = req.body;

    const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ name, email })
        .eq('id', req.params.id)
        .select()
        .single();

    if (error || !updatedUser) {
        return res.status(404).json({ message: 'Nie udało się zaktualizować użytkownika.' });
    }

    res.json(updatedUser);
});

// Delete - usunięcie użytkownika po ID
app.delete('/users/:id', async (req, res) => {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', req.params.id);

    if (error) {
        return res.status(404).json({ message: 'Nie udało się usunąć użytkownika.' });
    }

    res.json({ message: 'Użytkownik usunięty.' });
});


//-------------------------------------------------------------------------------------------------------------------------------------
// Endpoint do logowania

// Endpoint do logowania
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Wyszukaj użytkownika w Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
  
    if (error || !user) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
    }
  
    try {
      // Porównanie hasła
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
      }
  
      // Generowanie tokena JWT
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
  
      res.json({ message: 'Zalogowano pomyślnie', token });
    } catch (error) {
      console.error("Błąd przy logowaniu:", error);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  });


// Middleware do weryfikacji tokenu
const authenticate = (req, res, next) => {
    const token = req.cookies.token; // Pobieranie tokena z ciasteczek

    if (!token) {
        return res.status(401).json({ message: 'Brak tokenu, dostęp zabroniony' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Nieprawidłowy token, dostęp zabroniony' });
    }
};

app.get('/profile', authenticate, async (req, res) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email') // Pomijamy hasło!
        .eq('id', req.user.id)
        .single();

    if (error || !user) {
        return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    res.json(user);
});

//Wylogowywanie sie
app.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Wylogowano pomyślnie' });
});

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
