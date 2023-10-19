const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Master = require('../models/masterModel');

// @desc    Create master
// @route   POST /api/masters
// @access  Private
const createMaster = asyncHandler(async (req, res) => {
    const { payload: {
        type,
        name,
        description,
        enabled
    } } = req.body;
    if (!type || !name) {
        res.status(400);
        throw new Error('Incluir tipo y nombre');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const master = await Master.create({
        type,
        name,
        description,
        enabled,
        user: req.id
    });


    if (!master) {
        res.status(400);
        throw new Error('Master validation failed');
    }

    console.log('master ..:', master);

    res.status(201).json(master);
});


// @desc    Get masters
// @route   GET /api/masters
// @access  Private
const getMasters = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getMasters ..:', req);
    const { type, name } = req.query;
    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }
    let masters;
    if (name) {
        masters = await Master.find({
            type: type,
            name: new RegExp(name, 'i')
        });
    } else {
        masters = await Master.find({
            type: type
        });
    }

    console.log('masters ..:', masters);
    res.status(200).json(masters);
});


// @desc    Update master
// @route   PUT /api/master
// @access  Private
const updateMaster = asyncHandler(async (req, res) => {
    console.log('request updateMaster ...:', req);
    const { payload: {
        name,
        description,
        enabled } } = req.body;
    /*
    if (!name) {
        res.status(400);
        throw new Error('Incluir nombre');
    }
    */

    const master = await Master.findById(req.params.id);

    if (!master) {
        res.status(404);
        throw new Error('Master not found');
    }


    const updatedMaster = await Master.findByIdAndUpdate(req.params.id,
        {
            name,
            description,
            enabled
        },
        { new: true });

    console.log('updatedMaster ..:', updatedMaster);

    res.status(200).json(updatedMaster);

});

module.exports = {
    createMaster,
    getMasters,
    updateMaster
};
