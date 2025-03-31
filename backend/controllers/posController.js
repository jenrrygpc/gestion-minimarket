const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Pos = require('../models/posModel');
const PosShift = require('../models/posShiftModel');

// @desc    Create pos
// @route   POST /api/pos
// @access  Private
const createPos = asyncHandler(async (req, res) => {
    const {
        payload: {
            name,
            store
        }
    } = req.body;
    if (!name || !store) {
        res.status(400);
        throw new Error('Incluir nombre y tienda');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const newPos = await Pos.create({
        name,
        store,
        user: req.id
    });


    if (!newPos) {
        res.status(400);
        throw new Error('Fallo la creación de POS');
    }

    console.log('newPos ..:', newPos);

    res.status(201).json(newPos);
});


// @desc    Get measures
// @route   GET /api/measures
// @access  Private
const getPos = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getMeasures ..:', req);
    const { name } = req.query;
    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }

    let posList;
    if (name) {
        posList = await Pos.find({
            name: new RegExp(name, 'i')
        });
    } else {
        posList = await Pos.find();
    }

    console.log('posList ..:', posList);
    res.status(200).json(posList);
});

const updatePos = asyncHandler(async (req, res) => {
    console.log('request updatePos ...:', req);
    const { payload: {
        name,
        store } } = req.body;
    /*
    if (!name) {
        res.status(400);
        throw new Error('Incluir nombre');
    }
    */

    const posFound = await Pos.findById(req.params.id);

    if (!posFound) {
        res.status(404);
        throw new Error('Punto de venta no encontrado');
    }


    const updatedPos = await Pos.findByIdAndUpdate(req.params.id,
        {
            name,
            store
        },
        { new: true });

    console.log('updatedPos ..:', updatedPos);

    res.status(200).json(updatedPos);

});

const getAvailablePos = asyncHandler(async (req, res) => {
    // obtener todos los POS disponibles en la tienda.
    const allPos = await Pos.find({ store: req.params.storeId });

    // obtener todos los POS que están abiertos
    const openPos = await Pos   Shift.find({ store: req.params.storeId, status: 'ABIERTO' });

    // filtrar los POS disponibles
    const availablePos = allPos.filter(pos => !openPos.some(open => open._id.toString() === pos._id.toString()));

    res.status(200).json(availablePos);

});

module.exports = {
    createPos,
    getPos,
    updatePos,
    getAvailablePos
};
