import express from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../../middleware/auth.js';
import Post from '../../models/Posts.js';
import User from '../../models/User.js';
import Profile from '../../models/Profile.js';

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

//@route        PUT api/posts/like/:user_id
//@desc         Like a post
//@access       Private
router.put('/like/:post_id', auth, async (req, res) => {
    try{
        //Check if the post has been already liked
        let post = await Post.findById(req.params.post_id);

        const checkLikes = post.likes.filter(a => a.user.toString() === req.user.id).length > 0; 
        if(checkLikes) {
            return res.status(400).json({
                error: [{
                    msg: 'Post Liked Already'
                }]
            });
        }
        await post.likes.unshift({ 
            user: req.user.id
        });

        await post.save();
        res.json(post.likes);
    }   

    catch(err) {
        console.log(err.message);
        if(err.kind == 'ObjectId')
            res.status(400).json({
                error: [{
                    msg: "Post doesn't exist"
                }]
            });
        res.status(500).send('Server Error');
    }
});

//@route        PUT api/posts/unlike/:user_id
//@desc         Unlike a post
//@access       Private
router.put('/unlike/:post_id/:like_id', auth, async (req, res) => {
    try{
        let flag = false;
        //Check if the post has been already liked
        let post = await Post.findById(req.params.post_id);

        post.likes = post.likes.filter(like => {
            if (like._id == req.params.like_id)
                flag = true
            else
                return like
        });
        await post.save();

        if(flag) {
            res.json({
                info: [{
                    msg: "Post unliked"
                }]
            });
        }

        else {
            res.status(400).json({
                info: [{
                    msg: "Post doesn't exist"
                }]
            });
        }
        // res.json(post.likes);
    }   

    catch(err) {
        console.log(err.message);
        if(err.kind == 'ObjectId')
            res.status(400).json({
                error: [{
                    msg: "Post doesn't exist"
                }]
            });
        res.status(500).send('Server Error');
    }
})
export default router;