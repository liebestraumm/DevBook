import express from 'express';
import auth from '../../middleware/auth.js';
import Profile from '../../models/Profile.js';
import { check, validationResult } from 'express-validator';

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

//@route        POST api/profile
//@desc         Create or Update user Profile
//@access       Private

router.post('/', [auth, [
    check('status', "Status is Required").not().isEmpty(),
    check('skills', "Skills are required").not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({
            errors: errors.array()
        })
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagran,
        linkedin
    } = req.body

    //Build profile object
    const profileFields = {}
    profileFields.user = req.user.id;

    //Check if fields values have been introduced by the user
    if(company) profileFields.company = company
    if(website) profileFields.website = website
    if(location) profileFields.location = location
    if(bio) profileFields.bio = bio
    if(status) profileFields.status = status
    if(githubusername) profileFields.githubusername = githubusername
    if(skills) {
        profileFields.skills = skills.split(',').map((skill) => 
            skill.trim()
        )
    }

    console.log(profileFields.skills)

    res.send('Hello');
    
})

export default router;