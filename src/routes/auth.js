// https://github.com/stuyy/expressjs-tutorial/blob/d2d78d5011c369202adf4ba1c807acb1b376dfaf/src/routes/auth.js

import Router from 'express';
import passport from 'passport';

const router = Router();

router.get('/discord', passport.authenticate('discord'), (req, res) => {
    res.sendStatus(200);
});

router.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/' // TODO add "flash" or similar to inform user about failure
}), (req, res) => {
    res.redirect('/');
});

export default router;