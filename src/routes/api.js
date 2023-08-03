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
    console.log(JSON.stringify(selectedItems));
    return res.json({ message: 'Data received and processed successfully!' });
});

export default router;