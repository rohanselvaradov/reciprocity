// https://github.com/stuyy/expressjs-tutorial/blob/d2d78d5011c369202adf4ba1c807acb1b376dfaf/src/strategies/discord.js

import passport from 'passport';
import { Strategy } from 'passport-discord';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = '1132792157967745074'
const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback' // TODO change to /auth/discord/redirect here, on Discord, and in auth.js
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const scopes = ['identify', 'guilds', 'guilds.members.read']

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser((id, done) => {
    // temporarily hardcode a user object
    const user = {
        discordId: -1,
        username: 'test_user',
    };
    done(null, user);
});

passport.use(new Strategy(
    {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: REDIRECT_URI,
        scope: scopes
    },
    (accessToken, refreshToken, profile, done) => {
        try {
            const user = findOrCreateUser(profile); // TODO implement findOrCreateUser
            return done(null, user);
        } catch (err) {
            console.log(err);
            return done(err, null);
        }
    }
));