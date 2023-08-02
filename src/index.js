// https://github.com/stuyy/expressjs-tutorial/blob/d2d78d5011c369202adf4ba1c807acb1b376dfaf/src/index.js

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();

import './strategies/discord.js';

// set up routes
import authRoute from './routes/auth.js';

const app = express();
const PORT = 3000;

app.use(session({
    secret: 'super_secret_crypto_string',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoute);

app.listen(PORT, err => {
    if (err) return console.error(err);
    console.log(`Server running at http://localhost:${PORT}`);
  });