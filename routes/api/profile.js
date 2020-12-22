import express from 'express';
import auth from '../../middleware/auth.js';
import Profile from '../../models/Profile.js';

const router = express.Router();

//@route        GET api/profile/me
//@desc         Get current user's profile
//@access       Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if(!profile){
            res.status(400).json({
                msg: "There's no profile for this user"
            })
        }

        res.json(profile);
    }   

    catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;