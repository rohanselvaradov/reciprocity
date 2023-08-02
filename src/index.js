// https://github.com/stuyy/expressjs-tutorial/blob/d2d78d5011c369202adf4ba1c807acb1b376dfaf/src/index.js

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();

import './strategies/discord.js';

// set up routes
import authRoute from './routes/auth.js';
import matchesRoute from './routes/matches.js'

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
app.use('/matches', matchesRoute); // TODO add ensureauthenticated either here or directly in matches.js

app.get('/', (req, res) => {
    res.send(`<a href="/auth/discord">Click here to login</a>`);
});

app.get('/secretstuff', ensureAuthenticated, (req, res) => { // TODO might not put this here
  res.send('Welcome to the secret area')
});

app.listen(PORT, err => {
    if (err) return console.error(err);
    console.log(`Server running at http://localhost:${PORT}`);
  });