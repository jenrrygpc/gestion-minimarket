const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Profile = require('../models/profileModel');

// @desc    Create profile
// @route   POST /api/profiles
// @access  Private
const createProfile = asyncHandler(async (req, res) => {
    const { payload: {
        name,
        description,
        enabled
    } } = req.body;
    if ( !name) {
        res.status(400);
        throw new Error('Incluir nombre');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const profile = await Profile.create({
        name,
        description,
        enabled,
        user: req.id
    });


    if (!profile) {
        res.status(400);
        throw new Error('Profile validation failed');
    }

    console.log('profile ..:', profile);

    res.status(201).json(profile);
});


// @desc    Get profiles
// @route   GET /api/profiles
// @access  Private
const getProfiles = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getProfiles ..:', req);
    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }
    
    const profiles = await Profile.find();
    console.log('profiles ..:', profiles);
    res.status(200).json(profiles);
});


module.exports = {
    createProfile,
    getProfiles
};
