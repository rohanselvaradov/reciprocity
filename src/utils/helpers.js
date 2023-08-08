import { promises as fs } from 'fs'

export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    else res.redirect('/');
}

export async function swapNicknameForId(nick) {
    const data = await fs.readFile('./src/database/users.json', 'utf8');
    const users = JSON.parse(data);
    const user = users.find(user => user.nick === nick);
    return user.id;
}

export async function swapIdForNickname(id) {
    const data = await fs.readFile('./src/database/users.json', 'utf8');
    const users = JSON.parse(data);
    const user = users.find(user => user.id === id);
    return user.nick;
}