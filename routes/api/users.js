import express from 'express';
import {check, validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import gravatar from 'gravatar';
import jwt from 'jsonwebtoken';
import config from 'config';

//Importing User model
import User from '../../models/User.js';

const router = express.Router();

//@route        POST api/users
//@desc         Register User
//@access       Public 
router.post('/', [
    check('name', 'Name is Required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
] , async (req, res) => {
    try {
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
    const { name,email, password } = req.body;

    // See if user exists
    console.log(User)

    //Queries user by email
    let user = await User.findOne({
        email : email
    });

    if (user) {
        res.status(400).json({
            errors: [{
                msg: "User already exists"
            }]
        });
    }

    // Get users gravatar
    const avatar = gravatar.url(email, {
        s: '200', //max email string length
        r: 'pg',  // prevents indecent images
        d: "mm"   //Default picture
    });

    user = new User ({
        name,
        email,
        avatar,
        password
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

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