import Router from 'express';
const router = Router();
import { promises as fs } from 'fs';

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
    "1003788193755299920": {
      "987654321": [
        true,
        true,
        false
      ],
      "123456789": [
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

async function calculateMatches(userId) {
    // note that it outputs the matches as a map of username to array of mutually-matched indices.
    // TODO need to create a function that maps indices to actual activities 

        try {
        const data = await fs.readFile('database/users.json');
        let users = JSON.parse(data);

        let matches = {};
        let userPrefs = userInputs[userId];

        for (let otherUserId in userInputs) {
            if (otherUserId === userId) continue; // skip matching with self
            let otherUserPrefs = userInputs[otherUserId];

            for (let index in userPrefs[otherUserId]) {
                // console.log(userPrefs[otherUserId][index])
                if (userPrefs[otherUserId][index] && otherUserPrefs[userId][index]) {
                    if (matches[otherUserId]) {
                        matches[otherUserId].push(index);
                    } else {
                        matches[otherUserId] = [index];
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
    const calculatedMatches = await calculateMatches(req.session.passport.user);
    res.send(`Welcome! Your matches are: ${JSON.stringify(calculatedMatches)}.`) // 0 = hold hands, 1 = cuddle, 2 = lick feet
});

export default router