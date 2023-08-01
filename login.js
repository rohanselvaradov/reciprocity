import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();


const API_ENDPOINT = 'https://discord.com/api'
const CLIENT_ID = '1132792157967745074'
const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback'
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TARGET_GUILD_ID = process.env.TARGET_GUILD_ID;

const port = 3000;
const app = express();

const scopes = ['identify', 'guilds', 'guilds.members.read']


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    // Here you would make a database call to find the user based on their id
    // For simplicity, I'm just passing the id as the user object
    done(null, id);
});

passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URI,
    scope: scopes
},
function(accessToken, refreshToken, profile, done) {
    // mockFindOrCreate({ discordId: profile.id }, function(err, user) {
        return done(null, profile);
    // });
}));

app.use(session({
    secret: 'super_secret_crypto_string',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


// // Mock function to simulate User.findOrCreate for testing
// function mockFindOrCreate({ discordId }, cb) {
//     // For testing, we'll use a static user object with some basic properties
//     const mockUser = {
//       id: 1,
//       username: 'test_user',
//       discordId: discordId,
//       // Add any other relevant properties as needed
//     };  
//     return cb(null, mockUser);
//   }

app.get('/', (req, res) => {
    res.send(`<a href="/auth/discord">Click here to login</a>`);
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/'}),
    (req, res) => {
        res.redirect('/secretstuff') // Successful auth
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/secretstuff', ensureAuthenticated, (req, res) => {
    res.json(req.user);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    else res.redirect('/');
}

app.listen(port, err => {
    if (err) return console.error(err);
    console.log(`Server running at http://localhost:${port}`);
  });

  // https://github.com/stuyy/expressjs-tutorial/tree/d2d78d5011c369202adf4ba1c807acb1b376dfaf/src