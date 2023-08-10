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

export async function calculateMatches(userId) {
    // note that it outputs the matches as a map of nickname to array of mutually-matched indices.
    // TODO need to create a function that maps indices to actual activities 

    try {
        const data = await fs.readFile('./src/database/preferences.json');
        let preferences = JSON.parse(data);

        let matches = {};
        let userPrefs = preferences[userId];

        for (let otherUserId in preferences) {
            if (otherUserId === userId) continue; // skip matching with self
            let otherUserPrefs = preferences[otherUserId];
            for (let key in userPrefs) {
                if (key === otherUserId && otherUserPrefs[userId]) { // if the other user has some preferences for the current user
                    let commonPrefs = userPrefs[key].filter(pref => otherUserPrefs[userId].includes(pref));
                    if (commonPrefs.length > 0) {
                        if (matches[otherUserId]) {
                            matches[otherUserId].push(...commonPrefs);
                        } else {
                            matches[otherUserId] = commonPrefs;
                        }
                    }
                }
            }
        }
        let matchesWithNicknames = {}; // NOTE is there a way to do this without creating a new object? (i.e. build up the matches object with nicknames instead of ids)
        for (const key in matches) {
            const nick = await swapIdForNickname(key);
            matchesWithNicknames[nick] = matches[key];
        }
        return matchesWithNicknames;
    } catch (err) {
        console.error(err);
        return;
    }
}