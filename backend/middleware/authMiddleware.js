const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
//const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    console.log('req:', req);
    let token;
    const { headers: { authorization } } = req;

    if (authorization && authorization.startsWith('Bearer')) {

        try {
            // Get token from header
            token = authorization.split(' ')[1];
            //verify token
            console.log('decoded before ..:');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('decoded after ..:', decoded);
            //Get user from token
            req.id = decoded.id;
            //req.user = await User.findById(decoded.id).select('-password');

            next();

        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error('Not authorized');
        }

    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized');
    }
});

module.exports = {
    protect
}
