// https://github.com/stuyy/expressjs-tutorial/blob/d2d78d5011c369202adf4ba1c807acb1b376dfaf/src/strategies/discord.js

import passport from 'passport';
import { Strategy } from 'passport-discord';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = '1132792157967745074'
const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback'
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const scopes = ['identify', 'guilds', 'guilds.members.read']

async function findUser(id) {
    try {
        const data = await fs.readFile('./src/database/users.json') // TODO check if this is right way to specify path (& ditto elsewhere)
        const users = JSON.parse(data);
        const user = users.find((user) => user.id === id);
        return user || null;
    } catch (err) {
        console.error(err);
        return;
    }
};

async function findOrCreateUser(profile) {
    const user = await findUser(profile.id);
    if (user) return user;
    else {
        try {
            const data = await fs.readFile('./src/database/users.json')
            const { id, username } = profile;
            const currentUser = { id, username } // TODO see if more concise way of doing this
            let users = JSON.parse(data);
            users.push(currentUser);
            await fs.writeFile('./src/database/users.json', JSON.stringify(users, null, 2));
            return currentUser;
        } catch (err) {
            console.error(err);
            return;
        }
    }
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser(async (id, done) => {
    try {
        const user = await findUser(id);
        if (!user) console.error(`User with id ${id} not found`);
        done(null, user);
    } catch (err) {
        console.log(err);
        done(err, null);
    }
});

passport.use(new Strategy(
    {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: REDIRECT_URI,
        scope: scopes
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await findOrCreateUser(profile);
            return done(null, user);
        } catch (err) {
            console.log(err);
            return done(err, null);
        }
    }
));