import Router from 'express';
import express from 'express';
import { promises as fs } from 'fs'
const router = Router();

router.get('/users', async (req, res) => { // used to provide list of usernames to populate checkbox page on /preferences
    try {
        const data = await fs.readFile('./src/database/users.json', 'utf8');
        const users = JSON.parse(data);
        const otherUsers = users.filter(user => user.id !== req.user.id);
        const usernames = otherUsers.map(user => user.username);
        res.json(usernames);
    } catch (err) {
        console.log(`Error reading file from disk: ${err}`);
        res.sendStatus(500);
    }
});

router.post('/submit', express.json(), async (req, res) => { // used to accept user preferences from /preferences
    const { selectedItems } = req.body;
    try {
        const data = await fs.readFile('./src/database/new_preferences.json', 'utf8');

    
    const preferences = JSON.parse(data);
    const userPrefs = {
        [req.user.id]: selectedItems
    }
    const newPreferences = {...preferences, ...userPrefs}; // merge userPrefs into preferences

        await fs.writeFile('./src/database/new_preferences.json', JSON.stringify(newPreferences, null, 2));
    } catch (err) {
        console.log(`Reading or writing to file: ${err}`);
        res.sendStatus(500);
    }
    // TODO replace usernames with user ids
    return res.json({ message: 'Data received and processed successfully!' });
});

export default router;