import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';

import express from 'express';
import session from 'express-session';


const API_ENDPOINT = 'https://discord.com/api'
const CLIENT_ID = '1132792157967745074'
const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback'
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TARGET_GUILD_ID = process.env.TARGET_GUILD_ID;

const port = 3000;
const app = express();

app.use(session({
    secret: 'super_secret_crypto_string',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


const scopes = ['identify', 'guilds', 'guilds.members.read']

// Mock function to simulate User.findOrCreate for testing
function mockFindOrCreate({ discordId }, cb) {
    // For testing, we'll use a static user object with some basic properties
    const mockUser = {
      id: 1,
      username: 'test_user',
      discordId: discordId,
      // Add any other relevant properties as needed
    };
    console.log(JSON.stringify(mockUser))
  
    return cb(null, mockUser);
  }

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // redirect them to login page
        res.redirect('/');
    }
}

passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URI,
    scope: scopes
},
function(accessToken, refreshToken, profile, cb) {
    mockFindOrCreate({ discordId: profile.id }, function(err, user) {
        return cb(err, user);
    });
}));

passport.serializeUser((user, done) => {
    console.log(done.toString())
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Here you would make a database call to find the user based on their id
    // For simplicity, I'm just passing the id as the user object
    console.log(done.toString())
    done(null, { id });
});

app.get('/', (req, res) => {
    res.send(`<a href="/auth/discord">Click here to login</a>`);
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/'}),
(req, res) => {
    req.session.authenticated = true;
    res.redirect('/secretstuff') // Successful auth
});

app.get('/secretstuff', ensureAuthenticated, (req, res) => {
    res.send('You have reached the secret area');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
