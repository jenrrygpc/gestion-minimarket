const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

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

// Loads the requesting user's role/permissions and checks them against requiredCodes (isAdmin bypasses check)
const authorize = (...requiredCodes) => asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.id).populate({
        path: 'role',
        populate: { path: 'permissions' }
    });

    if (!user) {
        res.status(401);
        throw new Error('Not authorized');
    }

    req.user = user;

    if (user.isAdmin) {
        return next();
    }

    const userPermissionCodes = (user.role && user.role.permissions || [])
        .map((permission) => permission.code);

    const hasAllPermissions = requiredCodes.every((code) => userPermissionCodes.includes(code));

    if (!hasAllPermissions) {
        res.status(403);
        throw new Error('No tiene permisos para realizar esta acción');
    }

    next();
});

module.exports = {
    protect,
    authorize
}
