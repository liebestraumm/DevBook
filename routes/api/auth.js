import express from 'express';
import auth from '../../middleware/auth.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import config from 'config';
import {check, validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';

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


//@route        POST api/users
//@desc         User Registration
//@access       Public 
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
] , async (req, res) => {
    //Get request object properties to validate them
    const errors = validationResult(req);
    console.log(errors)

    //Create Response if there are errors. Status 400 if there's any error.
    if(!errors.isEmpty()){
        return res.status(400).json({ 
            errors: errors.array()
         });
    }

    //Destructuring name, email and password values from request.body
    const { email, password } = req.body;

    // See if user exists
    console.log(User)

    try {
    //Queries user by email
    let user = await User.findOne({
        email : email
    });

    if (!user) {
        res.status(400).json({
            errors: [{
                msg: "Invalid Credentials"
            }]
        });
    }

    //Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400).json({
            errors: [{
                msg: "Invalid Credentials"
            }]
        });
    }

    // Return jsonwebtoken
    const payload = {
        user: {
            id: user.id
        }
    }
    jwt.sign(payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 }, (err, token) => {
                //If error, throws an error. If no error, it sends the token back to the client giving access
                if(err) 
                    throw err
                res.json({ token });
            });
    }

    catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;