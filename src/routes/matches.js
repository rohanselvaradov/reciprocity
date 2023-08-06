import Router from 'express';
import { promises as fs } from 'fs';

const router = Router();

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

userInputs = {
  "987654321": {
    "123456789": ["1"],
    "1003788193755299920": ["1"],
    "589352688744005653": ["2", "3"]
  },
  "1003788193755299920": {
    "987654321": ["1", "2"],
    "123456789": ["1"],
    "589352688744005653": ["2", "3"]
  }
};

async function calculateMatches(userId) {
    // note that it outputs the matches as a map of username to array of mutually-matched indices.
    // TODO need to create a function that maps indices to actual activities 

        try {
        const data = await fs.readFile('./src/database/users.json');
        let users = JSON.parse(data);

        let matches = {};
        let userPrefs = userInputs[userId];

        for (let otherUserId in userInputs) {
            if (otherUserId === userId) continue; // skip matching with self
            let otherUserPrefs = userInputs[otherUserId];
            for (let key in userPrefs) {
              if (key === otherUserId && otherUserPrefs[userId]) { // if the other user has preferences for the current user
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
    res.send(`Welcome! Your matches are: ${JSON.stringify(calculatedMatches)}.`) // 0 = hold hands, 1 = cuddle, 2 = lick feet
});

export default router