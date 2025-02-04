import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import mqtt from 'mqtt';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Inicjalizacja Supabase z SERVICE KEY
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
app.use(express.json({ strict: false }));

// app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


const mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');


mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');
  mqttClient.subscribe('chat', (err) => {
    if (err) {
      console.log('Error subscribing:', err);
    }
  });
});

// Handling messages
mqttClient.on('message', (topic, message) => {
  console.log('Received message:', message.toString());
  // Możesz wysłać wiadomość do klienta
});






// Middleware autentykacji
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.cookies.token;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Brak tokenu autoryzacyjnego' });
    }

    const token = authHeader.split(' ')[1] || authHeader;

    try {
        // Weryfikacja tokenu JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ustawienie danych użytkownika w req.user
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Błąd autentykacji:', error);
        res.status(401).json({ message: 'Nieprawidłowy token' });
    }
};

// CRUD dla ankiet
app.post('/surveys', authenticate, async (req, res) => {
  try {
    const { title, description} = req.body;
    
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Nieprawidłowe dane ankiety' });
    }

    const { data, error } = await supabase
      .from('surveys')
      .insert([{
        title: title.trim(),
        description: description?.trim(),
        author_id: req.user.id
      }])
      .select('*');

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Błąd tworzenia ankiety:', error);
    res.status(500).json({ message: error.message });
  }
});
// Pobranie wszystkich ankiet
app.get('/surveys/search', async (req, res) => {
    const { q } = req.query; 
    console.log("XD, request dotarł do endpointu!");
    console.log("Query params:", req.query);

    if (!q) {
        return res.status(400).json({ message: "Brak parametru wyszukiwania." });
    }

    try {
        console.log("Zapytanie do Supabase...");

        const { data, error } = await supabase
            .from('surveys')
            .select('*')
            .ilike('title', `%${q}%`); // Wyszukiwanie po tytule

        if (error) {
            console.error("Błąd Supabase:", error);
            return res.status(500).json({ message: 'Błąd Supabase' });
        }

        console.log("Zwrócone dane z Supabase:", data);

        if (!data || data.length === 0) {
            console.log("Brak pasujących ankiet.");
            return res.status(404).json({ message: 'Nie znaleziono ankiet.' });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Błąd serwera:", error);
        return res.status(500).json({ message: 'Błąd serwera' });
    }
});
//podjeta proba zrobienia mqtt i websocketow
// app.post('/surveys/:surveyId/comments', async (req, res) => {
//     const { surveyId } = req.params;
//     const { content, author_id } = req.body;
  
//     if (!content || !author_id) {
//       return res.status(400).json({ message: 'Brak wymaganych danych' });
//     }
  
//     try {
//       // Zapisz komentarz w bazie danych
//       const { data, error } = await supabase
//         .from('comments')
//         .insert([{ survey_id: surveyId, content, author_id }]);
  
//       if (error) {
//         console.error('Błąd zapisywania komentarza:', error);
//         return res.status(500).json({ message: 'Błąd przy zapisywaniu komentarza' });
//       }
  
//       // Po zapisaniu komentarza, wyślij go do wszystkich połączonych klientów przez WebSocket
//       wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(JSON.stringify({
//             type: 'new-comment',
//             surveyId,
//             comment: { content, author_id }
//           }));
//         }
//       });
  
//       res.status(200).json({ message: 'Komentarz dodany', data });
//     } catch (error) {
//       console.error('Błąd:', error);
//       res.status(500).json({ message: 'Błąd przy przetwarzaniu zapytania' });
//     }
//   });

app.post('/chat/messages', async (req, res) => {
    const { content, author_id } = req.body;
  
    if (!content || !author_id) {
      return res.status(400).json({ message: 'Brak wymaganych danych' });
    }
  
    try {
      // Zapisz wiadomość w bazie danych (przykład z Supabase)
      const { data, error } = await supabase
        .from('messages')
        .insert([{ content, author_id }]);
  
      if (error) {
        console.error('Błąd zapisywania wiadomości:', error);
        return res.status(500).json({ message: 'Błąd przy zapisywaniu wiadomości' });
      }
  
    
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new-message',
            message: { content, author_id }
          }));
        }
      });
  
      res.status(200).json({ message: 'Wiadomość dodana', data });
    } catch (error) {
      console.error('Błąd:', error);
      res.status(500).json({ message: 'Błąd przy przetwarzaniu zapytania' });
    }
  });

app.get('/surveys', async (req, res) => {
    console.log("xd")
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
        
        const { data: survey, error } = await supabase
            .from('surveys')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !survey) {
            return res.status(404).json({ message: 'Ankieta nie znaleziona.' });
        }

     
        const { data: updatedSurvey, error: updateError } = await supabase
            .from('surveys')
            .update({ title, description, author_id, questions })
            .eq('id', id)
            .select('*') 
            .single(); 

        if (updateError) {
            return res.status(500).json({ message: 'Błąd serwera przy aktualizacji ankiety', details: updateError.message });
        }

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

        if (error) {
            return res.status(500).json({ message: 'Błąd przy usuwaniu ankiety', details: error.message });
        }

        // sprawdzamy czy zostala usunieta
        const { data } = await supabase
            .from('surveys')
            .select('*')
            .eq('id', id);

        // jesli brak ankiety to rip blad
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
app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;

    // Walidacja danych
    const errors = [];
    if (!name) errors.push('Pole "name" jest wymagane');
    if (!email) errors.push('Pole "email" jest wymagane');
    if (!password) errors.push('Pole "password" jest wymagane');
    
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    //jakis regex to sprawdzania poprawnego formatu maila 
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Nieprawidłowy format email' });
    }

    try {
        // sprawdzamy uniklanosc maila
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (existingUser) {
            return res.status(409).json({ message: 'Użytkownik już istnieje' });
        }

        // hashowanie hasla
        const hashedPassword = await bcrypt.hash(password, 10);

        // nowy user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ 
                name, 
                email, 
                password: hashedPassword,
                created_at: new Date().toISOString() 
            }])
            .select('id, name, email, created_at')
            .single();

        if (insertError) throw insertError;

        const token = jwt.sign(
            { 
                id: newUser.id,
                email: newUser.email,
                name: newUser.name 
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, //czas zycia ciacha XD
            sameSite: 'Strict',
        });

        res.status(201).json({
            ...newUser,
            token
        });

    } catch (error) {
        console.error('Błąd rejestracji:', error);
        res.status(500).json({ 
            message: error.message || 'Wewnętrzny błąd serwera',
            details: error.details || null
        });
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
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Znajdź użytkownika w TWOJEJ tabeli users
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return res.status(401).json({ message: 'Nieprawidłowe dane logowania' });
        }

        // 2. Sprawdź hasło
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Nieprawidłowe dane logowania' });
        }

        // 3. Generuj token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 4. Zwróć token i dane użytkownika
        res.json({
            message: 'Zalogowano pomyślnie',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Błąd przy logowaniu:", error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});
  
  app.post('/logout', authenticate, async (req, res) => {
    try {
      await supabase.auth.signOut();
      res.json({ message: 'Wylogowano pomyślnie' });
    } catch (error) {
      console.error('Błąd wylogowywania:', error);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  });
app.get('/profile', authenticate, async (req, res) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email') 
        .eq('id', req.user.id)
        .single();

    if (error || !user) {
        return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    res.json(user);
});



app.post('/answers', async (req, res) => {
    const { surveyId, answers, userId } = req.body;

    // Sprawdzenie, czy wszystkie wymagane dane zostały przekazane
    if (!surveyId || !answers || !userId) {
        return res.status(400).json({ message: 'Brak wymaganych danych' });
    }

    try {
        const insertPromises = Object.keys(answers).map(async (questionId) => {
            const answer = answers[questionId];
            
            const { data, error } = await supabase
                .from('answers')
                .insert([
                    {
                        survey_id: surveyId,
                        user_id: userId,
                        question_id: questionId,
                        answer: answer,
                    },
                ]);

            if (error) {
                throw new Error(error.message);
            }
        });

        
        await Promise.all(insertPromises);

        // jesli promise git
        res.status(200).json({ message: 'Odpowiedzi zapisane pomyślnie!' });
    } catch (error) {
        console.error('Błąd zapisywania odpowiedzi:', error);
        res.status(500).json({ message: 'Wystąpił błąd przy zapisywaniu odpowiedzi.' });
    }
});

app.post('/questions', async (req, res) => {
    const { survey_id, question_text, question_type, options } = req.body;

    try {
        const { data, error } = await supabase
            .from('questions')
            .insert([{
                survey_id: survey_id,
                question_text: question_text,
                question_type: question_type,
                options: question_type === 'options' ? options : null
            }])
            .select();

        if (error) {
            console.error('Błąd podczas insercji:', error);
            throw new Error(error.message);
        }

        if (!data || data.length === 0) {
            console.error('Brak danych w odpowiedzi!');
            return res.status(500).json({ message: 'Brak danych po zapisaniu pytania.' });
        }
        console.log('Zapisane pytanie:', data[0])
        res.status(201).json(data[0]);  
    } catch (error) {
        console.error('Błąd tworzenia pytania:', error);
        res.status(500).json({ message: 'Wystąpił błąd przy tworzeniu pytania.' });
    }
});

app.get('/questions', async (req, res) => {
    const { survey_id } = req.query; 

    if (!survey_id) {
        return res.status(400).json({ message: 'Brak survey_id w zapytaniu.' });
    }

    try {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('survey_id', survey_id);  // Filtrujemy pytania po survey_id

        if (error) {
            console.error('Błąd pobierania pytań:', error);
            return res.status(500).json({ message: 'Wystąpił problem podczas pobierania pytań.' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Brak pytań dla tej ankiety.' });
        }

        res.status(200).json(data); // Zwracamy pytania
    } catch (error) {
        console.error('Błąd:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas przetwarzania zapytania.' });
    }
});






app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(r.route.path);
    }
});





app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
