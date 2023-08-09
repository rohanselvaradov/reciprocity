// https://github.com/stuyy/expressjs-tutorial/blob/d2d78d5011c369202adf4ba1c807acb1b376dfaf/src/index.js

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import ejs from 'ejs';
import dotenv from 'dotenv';
dotenv.config();

import FileStore from 'session-file-store';
const fileStoreOptions = {
    retries: 0
};
const store = new (FileStore(session))(fileStoreOptions);

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import './src/strategies/discord.js';
import { ensureAuthenticated } from './src/utils/helpers.js';

// set up routes
import authRoute from './src/routes/auth.js';
import matchesRoute from './src/routes/DEPRECATED_matches.js'
import apiRoute from './src/routes/api.js'

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.use(session({
    secret: 'super_secret_crypto_string',
    cookie: {
        maxAge: 60000 * 60 * 24 * 30 // 1 month
    },
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoute);
app.use('/api', ensureAuthenticated, apiRoute); // TODO work out if this is best place to do the ensureAuthenticated

app.use(express.static('public'));

app.get('/preferences', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'preferences', 'index.html'))
});

app.get('/matches', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'matches', 'index.html'))
});

app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('home_authenticated', { user: req.user });
    } else {
        res.render('home_guest')
    }
});

app.listen(PORT, err => {
    if (err) return console.error(err);
    console.log(`Server running at http://localhost:${PORT}`);
});