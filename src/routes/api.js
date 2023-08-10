import Router from 'express';
import express from 'express';
import { promises as fs } from 'fs'
import { swapNicknameForId, calculateMatches } from '../utils/helpers.js';
const router = Router();

router.get('/users', async (req, res) => { // used to provide list of nicknames to populate checkbox page on /preferences
    try {
        const data = await fs.readFile('./src/database/users.json', 'utf8');
        const users = JSON.parse(data);
        const otherUsers = users.filter(user => user.id !== req.user.id);
        const nicknames = otherUsers.map(user => user.nick);
        res.json(nicknames);
    } catch (err) {
        console.log(`Error reading file from disk: ${err}`);
        res.sendStatus(500);
    }
});

router.post('/submit', express.json(), async (req, res) => { // used to accept user preferences from /preferences
    const { selectedItems } = req.body;
    let selectedWithUsernames = {};
    for (const key in selectedItems) {
        // GPT suggests wrapping in `if (originalObject.hasOwnProperty(key)) {` check. Don't think necessary
        const id = await swapNicknameForId(key)
        selectedWithUsernames[id] = selectedItems[key];
    }
    try {
        const data = await fs.readFile('./src/database/preferences.json', 'utf8');
        const preferences = JSON.parse(data);
        const userPrefs = {
            [req.user.id]: selectedWithUsernames
        }
        const newPreferences = { ...preferences, ...userPrefs }; // merge userPrefs into preferences

        await fs.writeFile('./src/database/preferences.json', JSON.stringify(newPreferences, null, 2));
    } catch (err) {
        console.log(`Reading or writing to file: ${err}`);
        // res.sendStatus(500); // NOTE this isn't sent as cannot set headers after they are sent 
    }
    return res.json({ message: 'Data received and processed successfully!' }); // TODO visual confirmation of submitting not in console
});

router.get('/matches', async (req, res) => { // used to provide matches to /matches
    const matches = await calculateMatches(req.user.id);
    res.json(matches);
   
});

export default router;