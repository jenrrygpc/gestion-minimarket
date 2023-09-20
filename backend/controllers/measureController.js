const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Measure = require('../models/measureModel');

// @desc    Create measure
// @route   POST /api/measures
// @access  Private
const createMeasure = asyncHandler(async (req, res) => {
    const { payload: { abbreviation,
        description } } = req.body;
    if (!abbreviation || !description ) {
        res.status(400);
        throw new Error('Incluir abreviación y descripcion');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const measure = await Measure.create({
            abbreviation,
            description,
            user: req.id
        });
    

    if (!measure) {
        res.status(400);
        throw new Error('Product validation failed');
    }

    console.log('measure ..:', measure);

    res.status(201).json(measure);
});


// @desc    Get measures
// @route   GET /api/measures
// @access  Private
const getMeasures = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getMeasures ..:', req);
    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }

    const measures = await Measure.find();
    console.log('measures ..:', measures);
    res.status(200).json(measures);
});

module.exports = {
    createMeasure,
    getMeasures
};
