import Router from 'express';
import { promises as fs } from 'fs';
import { swapIdForNickname } from '../utils/helpers.js';

const router = Router();

async function calculateMatches(userId) {
    // note that it outputs the matches as a map of username to array of mutually-matched indices.
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
        return matches;
    } catch (err) {
        console.error(err);
    }
}

router.get('/', async (req, res) => {
    const calculatedMatches = await calculateMatches(req.user.id);
    let matchesWithNicknames = {};
    for (const key in calculatedMatches) {
        const nick = await swapIdForNickname(key);
        matchesWithNicknames[nick] = calculatedMatches[key];
    }
    res.send(`Welcome! Your matches are: ${JSON.stringify(matchesWithNicknames)}.`) // 0 = hold hands, 1 = cuddle, 2 = lick feet
});

export default router