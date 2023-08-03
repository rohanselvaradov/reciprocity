// https://github.com/stuyy/expressjs-tutorial/blob/d2d78d5011c369202adf4ba1c807acb1b376dfaf/src/index.js

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import './src/strategies/discord.js';

// set up routes
import authRoute from './src/routes/auth.js';
import matchesRoute from './src/routes/matches.js'
import apiRoute from './src/routes/api.js'

const app = express();
const PORT = 3000;

app.use(session({
    secret: 'super_secret_crypto_string',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) { // TODO remove
  if (req.isAuthenticated()) return next();
  else res.redirect('/');
}

app.use('/auth', authRoute);
app.use('/matches', ensureAuthenticated, matchesRoute); // TODO work out if this is best place to do the ensureAuthenticated
app.use('/api', ensureAuthenticated, apiRoute);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send(`<a href="/auth/discord">Click here to login</a>`);
});

// app.use('/preferences', express.static(path.join(__dirname, 'protected', 'preferences'))); // TODO must be a better way of doing this
// app.get('/preferences', ensureAuthenticated, (req, res) => {
//   const filePath = path.join(__dirname, 'protected', 'preferences', 'index.html');
//   res.sendFile(filePath)
// });


app.listen(PORT, err => {
    if (err) return console.error(err);
    console.log(`Server running at http://localhost:${PORT}`);
  });