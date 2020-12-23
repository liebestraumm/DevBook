import express from 'express';
import auth from '../../middleware/auth.js';
import Profile from '../../models/Profile.js';
import User from '../../models/User.js';
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
                errors: [{
                    msg: "There's no profile for this user"
                }]
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
        instagram,
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

    //Build social object
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube
    if(twitter) profileFields.social.twitter = twitter
    if(facebook) profileFields.social.facebook = facebook
    if(linkedin) profileFields.social.linkedin = linkedin
    if(instagram) profileFields.social.instagram = instagram
    
    try{
        let profile = await Profile.findOne({
            user: req.user.id
        });
        if(profile) {
            //Update Profile
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );

            return res.json(profile);
        }

        //Create Profile
        profile = new Profile( profileFields );
        await profile.save();
        res.json(profile);
    }

    catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
    
});

//@route        GET api/profile
//@desc         Get all profiles
//@access       Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    }

    catch(err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

//@route        GET api/profile/user/:user_id
//@desc         Get profile by user id
//@access       Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        //Check if there's any profile related to user id:
        if(!profile) {
            res.status(400).json({
                errors: [{
                    msg: "Profile doesn't exist"
                }]
            });
        }

        res.json(profile);
    }
    catch(err) {
        console.log(err.message);
        if(err.kind == 'ObjectId') {
            res.status(400).json({
                errors: [{
                    msg: "Profile doesn't exist"
                }]
            });
        }
        res.status(500).send("Server Error");
    }
});

//@route        DELETE api/profile
//@desc         Delete Profile, User and Posts
//@access       Private
router.delete('/', auth, async (req, res) => {
    try {
        //@TODO - remove user's posts


        //Remove profile
        await Profile.findOneAndDelete({
            user: req.user.id
        });
        
        //Remove User
        await User.findOneAndDelete({
            _id: req.user.id
        });

        res.json({
            info: {
                msg: "User deleted"
            }
        });
    }

    catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

//@route        PUT api/profile/experience
//@desc         Add a profile experience
//@access       Private
router.put('/experience', [auth, [
    check('title', 'Title is Required').not().isEmpty(),
    check('company', 'Company name is required').not().isEmpty(),
    check('from', 'Starting date of work is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }
    //Create Experience Object
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExperience = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try{
        const profile = await Profile.findOne({
            user: req.user.id
        });

        profile.experience.unshift(newExperience);
        await profile.save();
        res.json(profile);
    }
    catch(err) {
        console.log(err);
        res.status(500).send('Server Error');
    }

});

//@route        DELETE api/profile/experience/:exp_id
//@desc         Delete a profile experience
//@access       Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try{
        let flag = false;
        const profile = await Profile.findOne({
            user: req.user.id
        });

        profile.experience = await profile.experience.filter(exp => {
            if( exp._id != req.params.exp_id ){
                return exp
            }
            else
                flag = true;
          });
        await profile.save();
        if(flag){
            res.json({
                info: {
                    msg: "Experience deleted"
                }
            });
        }
        else{
            res.json({
                info: {
                    msg: "Experience not found. Experience not deleted."
                }
            });
        }
    }

    catch(err) {
        console.log(err.message);
        if(err.kind == 'ObjectId') {
            return res.status(400).json({
                errors: [{
                    msg: "This experience doesn't exist"
                }]
            });
        }

        res.status(500).send('Server Error');
    }
});
export default router;