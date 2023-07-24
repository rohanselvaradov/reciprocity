// https://discord.com/developers/docs/topics/oauth2

import express from 'express';
import axios from 'axios';
import qs from 'querystring';
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config();

const API_ENDPOINT = 'https://discord.com/api'
const CLIENT_ID = '1132792157967745074'
const REDIRECT_URI = 'http://localhost:3000/discord_oauth_redirect'
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TARGET_GUILD_ID = process.env.TARGET_GUILD_ID;
const OAuth2URL = process.env.OAuth2URL;

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.redirect(OAuth2URL);
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
    const userData = await getUserData(accessToken.access_token);
    // res.send(`Welcome, ${userData.username}#${userData.discriminator}!`); // TODO show processing message
    
    const isInTargetGuild = userGuilds.some(guild => guild.id === TARGET_GUILD_ID); // TODO add some logic here 
    
    const currentUser = {
        discordId: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
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
    res.redirect('/users');
});


app.use(express.json());
app.get('/users', async (req, res) => {
    const isAuthenticated = true;

    if (isAuthenticated) {

        fs.readFile('users.json', (err, data) => {
            if (err) throw err;
            let users = JSON.parse(data);
            let userCheckboxes = users.map(user => {
              let checkboxes = '';
              for(let i=1; i<=4; i++) {
                checkboxes += `<label><input type="checkbox" name="${user.discordId}" value="${i}">${user.username}#${user.discriminator} Checkbox ${i}</label><br/>`;
              }
              return checkboxes;
            }).join('<br/>');
        
            let jsCode = `
            function getCheckboxValues() {
                var result = {};
                ${users.map(user => `
                result["${user.username}"] = [];
                $("input[name='${user.username}']:checked").each(function() {
                    result["${user.username}"].push($(this).val());
                });`).join('')}
                return result;
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


    } else {
        res.status(401).send('You must be logged in to view this information.');
    }
});

app.post('/submit', (req, res) => {
    console.log(req.body);
    console.log("Received data");
    res.send('Data received');
  });
  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

/*
TODO
- Allow users to select people and check off
- Logic for if reciprocal
*/