import express from 'express';
import auth from '../../middleware/auth.js';
import User from '../../models/User.js';

const router = express.Router();

//@route        GET api/auth
//@desc         Authentification route (Protected)
//@access       Public 
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById({
            _id: req.user.id
        }).select('-password') //Leaves password out of data to be sent
        res.json(user);
    }

    catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;