import { promises as fs } from 'fs'

export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    else res.redirect('/');
}

export async function swapUsernameForId(username) {
    const data = await fs.readFile('./src/database/users.json', 'utf8');
    const users = JSON.parse(data);
    const user = users.find(user => user.username === username);
    return user.id;
}

// maybe also swap ids for usernames?

export async function swapIdForUsername(id) {
    const data = await fs.readFile('./src/database/users.json', 'utf8');
    const users = JSON.parse(data);
    const user = users.find(user => user.id === id);
    return user.username;
}