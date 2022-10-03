const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  readFromFile,
  readAndAppend,
  writeToFile,
} = require('./helpers/fsUtils');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET Route for homepage
app.get('/', (req, res) => 
  res.sendFile(path.join(__dirname,'/public/index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname,'/public/notes.html'))
);

// GET Route for reading db.json file
app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// POST Route for receiving new note and saving to db.json file
app.post('/api/notes', (req, res) => {
  console.log(req.body);
  const {title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      id: uuidv4(),
    };

    readAndAppend(newNote, './db/db.json');
    res.json('New note added successfully');
  } else {
    res.error('Error adding note');
  }
});

// DELETE Route to remove a note from the db.json file
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
      const filteredNotes = json.filter((note) => note.id !== noteId);
      writeToFile('./db/db.json', filteredNotes);
      res.json(`Note ${noteId} has been deleted`);
    });
});

// GET Route for wildcard
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);