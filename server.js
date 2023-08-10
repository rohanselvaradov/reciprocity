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
import apiRoute from './src/routes/api.js'

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.use(session({
    secret: 'super_secret_crypto_string', // TODO generate securely
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
app.use('/api', ensureAuthenticated, apiRoute); // NOTE don't know if this is best place to do the ensureAuthenticated

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('pages/home', { user: req.user, isAuthenticated: req.isAuthenticated() }); // NOTE suspect there may be a better way to do this? e.g. should I pass the whole req through to rendering engine or is that security risk?
});

app.get('/preferences', ensureAuthenticated, (req, res) => { // NOTE should this be done with rendering instead?
    res.sendFile(path.join(__dirname, 'protected', 'preferences', 'index.html'))
});

app.get('/matches', ensureAuthenticated, (req, res) => { // NOTE should this be done with rendering instead?
    res.sendFile(path.join(__dirname, 'protected', 'matches', 'index.html'))
});

app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/'); // TODO message confirming logout
    });
});

app.listen(PORT, err => {
    if (err) return console.error(err);
    console.log(`Server running at http://localhost:${PORT}`);
});