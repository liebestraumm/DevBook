import express from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../../middleware/auth.js';
import Post from '../../models/Posts.js';
import User from '../../models/User.js';
import Profile from '../../models/Profile.js';
import Posts from '../../models/Posts.js';

const router = express.Router();

//@route        POST api/posts
//@desc         Create Posts
//@access       Private
router.post('/', [auth, [
    check('text', 'Text is Required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({
            errors: errors.array()
        });
    
    try {
        
    const user = await User.findById({
        _id: req.user.id
    }).select('-password');

    //Create Post Object
    const postFields = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        
    }

    const post = new Post( postFields );
    await post.save();
    res.json(post);
    }

    catch(err){
        console.log(err.message)
        res.status(500).send('Server Error');
    }

});

//@route        GET api/posts
//@desc         Get all posts
//@access       Private

router.get('/', auth, async (req, res) => {
    try{
        const posts = await Post.find().sort({
            date: -1 //Most Recent first
        });
        res.json(posts);
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("server Error");
    }
});

//@route        GET api/posts/:post_id
//@desc         Get post by ID
//@access       Private

router.get('/:post_id', auth, async (req, res) => {
    try{
        const posts = await Post.findById(
            req.params.post_id
        );

        if(!posts)
            return res.status(404).json({
                errors: [{
                    msg: 'Post not found'
                }]
            });
        
            res.send(posts);
    }
    catch(err){
        console.log(err.message);
        if(err.kind == 'ObjectId')
            return res.status(404).json({
                errors: [{
                    msg: 'Post not found'
                }]
            });
        res.status(500).send("Server Error");
    }
});

//@route        DELETE api/posts/:post_id
//@desc         Delete a post
//@access       Private

router.delete('/:post_id', auth, async (req, res) => {
    try{
        const posts = await Post.findById(
            req.params.post_id
        );

        if(!posts){
            return res.status(404).json({
                errors: [{
                    msg: 'Post not found. Post not deleted'
                }]
            });
        }

        else {
            if(posts.user != req.user.id){
                return res.status(401).json({
                    errors: [{
                        msg: "User not Authorized"
                    }]
                });
            }
            else {
                await Post.findByIdAndDelete(req.params.post_id);
                return res.json({
                    info: [{
                        msg: "Post deleted"
                    }]
                });
            }
        }
    }
    catch(err){
        console.log(err.message);
        if(err.kind == 'ObjectId')
            return res.status(404).json({
                errors: [{
                    msg: 'Post not found'
                }]
            });
        res.status(500).send("Server Error");
    }
});
export default router;