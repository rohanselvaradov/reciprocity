// https://github.com/stuyy/expressjs-tutorial/blob/d2d78d5011c369202adf4ba1c807acb1b376dfaf/src/strategies/discord.js

import passport from 'passport';
import { Strategy } from 'passport-discord';
import { promises as fs } from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = '1132792157967745074'
const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback'
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TARGET_GUILD_ID = process.env.TARGET_GUILD_ID;

const scopes = ['identify', 'guilds', 'guilds.members.read']

async function findUser(id) {
    try {
        const data = await fs.readFile('./src/database/users.json') // NOTE not sure if this is right way to specify path (& ditto elsewhere)
        const users = JSON.parse(data);
        const user = users.find((user) => user.id === id);
        return user || null;
    } catch (err) {
        console.error(err);
        return;
    }
};

async function findOrCreateUser(profile, accessToken) {
    const user = await findUser(profile.id);
    if (user) return user;
    else {
        try {
            if (!profile.guilds.some((guild) => guild.id === TARGET_GUILD_ID)) {
                throw new Error('User is not in the target guild');
            }
            const existingUsers = await fs.readFile('./src/database/users.json')
            const { id, username } = profile;
            const guildData = await axios.get(`https://discord.com/api/users/@me/guilds/${TARGET_GUILD_ID}/member`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            let { nick } = guildData.data;
            if (!nick) nick = username;
            const currentUser = { id, username, nick }; // NOTE is there a more concise way of doing this?
            let newUsers = JSON.parse(existingUsers);
            newUsers.push(currentUser);
            await fs.writeFile('./src/database/users.json', JSON.stringify(newUsers, null, 2));
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
            const user = await findOrCreateUser(profile, accessToken);
            return done(null, user);
        } catch (err) {
            console.log(err);
            return done(err, null);
        }
    }
));