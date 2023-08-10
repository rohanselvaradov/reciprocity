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

export async function calculateMatches(myUserId, preferences) {
    const matches = Object.keys(preferences).reduce((matches, theirUserId) => {
        if (theirUserId !== myUserId) {
            const thingsIdDo = preferences[myUserId]?.[theirUserId] ?? [];
            const thingsTheydDo = preferences[theirUserId]?.[myUserId] ?? [];
            const thingsInCommon = thingsIdDo.filter(thing => thingsTheydDo.includes(thing));
            if (thingsInCommon.length > 0) {
                matches[theirUserId] = thingsInCommon;
            }
        }
        return matches;
    }, {});
    let matchesWithNicknames = {}; // NOTE is there a way to do this without creating a new object? (i.e. build up the matches object with nicknames instead of ids)
    for (const key in matches) {
        const nick = await swapIdForNickname(key);
        matchesWithNicknames[nick] = matches[key];
    }
    return matchesWithNicknames;
};