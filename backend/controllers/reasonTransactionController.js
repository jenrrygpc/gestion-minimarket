const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const ReasonTransaction = require('../models/reasonTransactionModel');

// @desc    Create profile
// @route   POST /api/profiles
// @access  Private
const createRT = asyncHandler(async (req, res) => {
    const { payload: {
        name,
        description,
        enabled
    } } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Incluir nombre');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const reasonTransaction = await ReasonTransaction.create({
        name,
        description,
        enabled,
        user: req.id
    });


    if (!reasonTransaction) {
        res.status(400);
        throw new Error('ReasonTransaction validation failed');
    }

    console.log('reasonTransaction ..:', reasonTransaction);

    res.status(201).json(reasonTransaction);
});


// @desc    Get profiles
// @route   GET /api/profiles
// @access  Private
const getRTs = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getRTs ..:', req);
    const { name } = req.query;
    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }

    let RTs;
    if (name) {
        RTs = await ReasonTransaction.find({
            name: new RegExp(name, 'i')
        });
    } else {
        RTs = await ReasonTransaction.find();
    }

    console.log('RTs ..:', RTs);
    res.status(200).json(RTs);
});


module.exports = {
    createRT,
    getRTs
};
