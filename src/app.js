// https://discord.com/developers/docs/topics/oauth2

import express from 'express';
import axios from 'axios';
import qs from 'querystring';
import fs from 'fs';
import {promises as fsPromises} from 'fs';
import session from 'express-session';

import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';

const API_ENDPOINT = 'https://discord.com/api'
const CLIENT_ID = '1132792157967745074'
const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback'
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TARGET_GUILD_ID = process.env.TARGET_GUILD_ID;
const OAuth2URL = process.env.OAuth2URL;

const port = 3000;
const app = express();
app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'super_secret_string',
    cookie: { secure: false, httpOnly: false }, // TODO change to true
    resave: false,
    saveUninitialized: true
  }));


app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.send('You are logged in.');
    } else {
        res.redirect(OAuth2URL);
    }
});

async function exchangeCodeForToken(code) {
    const data = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    };
    try {
      const response = await axios.post(`${API_ENDPOINT}/oauth2/token`, qs.stringify(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
};

  async function getUserGuilds(accessToken) {
    try {
        const response = await axios.get(`${API_ENDPOINT}/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
    }
};


async function getUserData(accessToken) {
    try {
        const response = await axios.get(`${API_ENDPOINT}/users/@me`, { // TODO add nickname (https://discord.com/developers/docs/resources/user#get-current-user-guild-member)
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
    }
};


app.get('/discord_oauth_redirect', async (req, res) => {
    const code = req.query.code;
    const accessToken = await exchangeCodeForToken(code);
    const userGuilds = await getUserGuilds(accessToken.access_token);
    const userData = await getUserData(accessToken.access_token)
    // res.send(`Welcome, ${userData.username}!`); // TODO show processing message
    
    const isInTargetGuild = userGuilds.some(guild => guild.id === TARGET_GUILD_ID); // TODO add some logic here 
    
    const currentUser = {
        discordId: userData.id,
        username: userData.username,
    }

    fs.readFile('users.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('An error occurred while reading the user data.');
            return;
        }

        let users = JSON.parse(data);

        // Check if the current user is already in the file
        const userExists = users.some(user => user.discordId === currentUser.discordId);

        // If the user doesn't exist, add them
        if (!userExists) {
            users.push(currentUser);

            fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('An error occurred while writing the user data.');
                    return;
                }
        });
    }
    });
    // now that we have the user's data, we can redirect them to the matches page
    // need to pass on the access token to the matches page so it can make requests to the API
    // res.redirect(`/matches?access_token=${accessToken.access_token}`);
    req.session.authenticated = true;
    req.session.accessToken = accessToken.access_token;
    req.session.refreshToken = accessToken.refresh_token;
    res.redirect('/');
});

// MATCHES PROCESSING

// Assuming you have stored the user inputs in a dictionary-like object

let userInputs = {
    "987654321": {
      "123456789": [
        true,
        false,
        false
      ],
      "1003788193755299920": [
        true,
        false,
        false
      ],
      "589352688744005653": [
        false,
        true,
        true
      ]
    },
    "123456789": {
      "987654321": [
        true,
        true,
        false
      ],
      "1003788193755299920": [
        true,
        false,
        false
      ],
      "589352688744005653": [
        false,
        true,
        true
      ]
    }
  };

async function calculateMatches(userId) { // can add userInputs as a parameter
    // note that it outputs the matches as a map of username to array of mutually-matched indices.
    // TODO need to create a function that maps indices to actual activities 

        try {
        const data = await fsPromises.readFile('users.json'); // TODO work out why this needs promises version
        let users = JSON.parse(data);

        // Create a map of discordId to username
        let usernameMap = {};
        for (let user of users) {
            usernameMap[user.discordId] = user.username;
        }

        let matches = {};
        let userPrefs = userInputs[userId];

        for (let otherUserId in userInputs) {
            if (otherUserId === userId) continue; // skip matching with self
            let otherUserPrefs = userInputs[otherUserId];

            for (let index in userPrefs[otherUserId]) {
                console.log(userPrefs[otherUserId][index])
                if (userPrefs[otherUserId][index] && otherUserPrefs[userId][index]) {
                    let otherUsername = usernameMap[otherUserId];
                    if (matches[otherUsername]) {
                        matches[otherUsername].push(index);
                    } else {
                        matches[otherUsername] = [index];
                    }
                }
            }
        }
        return matches;
    } catch (err) {
        console.error(err);
    }
}

app.get('/matches', async (req, res) => {
    const accessToken = req.query.access_token;
    const userData = await getUserData(accessToken);
    const calculatedMatches = await calculateMatches(userData.id);
    res.send(`Welcome, ${userData.username}! Your matches are: ${JSON.stringify(calculatedMatches)}. 0 = hold hands, 1 = cuddle, 2 = lick feet`)
});

// USER INPUTS PROCESSING
app.get('/users', async (req, res) => {
    fs.readFile('users.json', (err, data) => {
        if (err) throw err;
        let users = JSON.parse(data);
        let userCheckboxes = "";
        for (let user of users) {
        userCheckboxes += `
        <fieldset>
        <legend>${user.username}</legend>
        <input type="checkbox" id="${user.username}-1">
        <label for="${user.username}1">Hold hands</label>
        <br>
        <input type="checkbox" id="${user.username}-2">
        <label for="${user.username}2">Cuddle</label>
        <br>
        <input type="checkbox" id="${user.username}-3">
        <label for="${user.username}3">Lick feet</label>
        </fieldset>
        `;
    }
            let jsCode = `
            function getCheckboxValues() {
                const form = document.querySelector("#userList");
                
                let thoughts = {};
                for (let i = 0; i < form.children.length; i++) {
                    let thoughtsAboutOnePerson = [];
                    for (let j = 0; j < form.children[i].children.length; j++) {
                        if (form.children[i].children[j].nodeName === "INPUT") {
                            thoughtsAboutOnePerson.push(form.children[i].children[j].checked);
                        }
                    }
                    thoughts[form.children[i].children[0].textContent] = thoughtsAboutOnePerson;
                }
                return thoughts;
            }
            
            $(document).ready(function() {
                $('#submit').click(function() {
                    var result = getCheckboxValues();
                    axios.post('/submit', result);
                });
            });
        `;
            fs.readFile('users.html', 'utf8', (err, html) => {
              if (err) throw err;
              html = html.replace('{{userCheckboxes}}', userCheckboxes);
              html = html.replace('{{jsCode}}', jsCode);
              res.send(html);
            });
          });
});

app.post('/submit', async (req, res) => {
    fs.readFile('preferences.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('An error occurred while reading the preferences data.');
            return;
        }

    let preferences = JSON.parse(data);
    let discordId = '100'
    let userPrefs = {
        [discordId]: req.body
    }
    preferences = {...preferences, ...userPrefs}; // merge userPrefs into preferences

        fs.writeFile('preferences.json', JSON.stringify(preferences, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('An error occurred while writing the user data.');
                return;
            }
    });
});

});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

/*
TODO
- make landing page better
  - button to get to input likes page
  - shows matches better
- make input likes page better
  - don't display self
  - display nicknames not usernames
- work out why users.json needs promises version
*/