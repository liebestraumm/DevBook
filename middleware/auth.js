import jwt from 'jsonwebtoken';
import config from 'config';

export default function(req, res, next){
    //Get token from header
    const token = req.header('x-auth-token');

    //Check if no token
    if(!token) {
        return res.status(401).json({
            msg: 'No token, authorization denied'
        });
    }

    //Verify Token 
    try {
        //Decoding token
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        //Add user from payload to user in request object
        req.user = decoded.user;
        next();
    }

    catch(err) {
        res.status(401).json({
            msg: 'Token is not valid'
        });
    }
}