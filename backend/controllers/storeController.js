const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Store = require('../models/storeModel');

// @desc    Create store
// @route   POST /api/stores
// @access  Private
const createStore = asyncHandler(async (req, res) => {
    const { payload: {
        name,
        description,
        address
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

    const store = await Store.create({
        name,
        description,
        address,
        user: req.id
    });
    console.log('store ..:', store);

    if (!store) {
        res.status(400);
        throw new Error('Error al crear Tienda');
    }

    res.status(201).json(store);
});


// @desc    Get stores
// @route   GET /api/stores
// @access  Private
const getStores = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getStores ..:', req);
    const { name } = req.query;
    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }
    let stores;
    if (name) {
        stores = await Store.find({
            name: new RegExp(name, 'i')
        });
    } else {
        stores = await Store.find();
    }

    console.log('stores ..:', stores);
    res.status(200).json(stores);
});

// @desc    Get stores
// @route   GET /api/stores
// @access  Private
const getStoresWithoutUser = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getStoresWithoutUser ..:', req);
    const { name } = req.query;
    let stores;
    if (name) {
        stores = await Store.find({
            name: new RegExp(name, 'i')
        });
    } else {
        stores = await Store.find();
    }

    console.log('stores ..:', stores);
    res.status(200).json(stores.map(store => ({
        id: store._id,
        name: store.name,
        description: store.description,
        address: store.address
    })));
});


// @desc    Update store
// @route   PUT /api/store
// @access  Private
const updateStore = asyncHandler(async (req, res) => {
    console.log('request updateStore ...:', req);
    const { payload: {
        name,
        description,
        address } } = req.body;
    /*
    if (!name) {
        res.status(400);
        throw new Error('Incluir nombre');
    }
    */

    const store = await Store.findById(req.params.id);

    if (!store) {
        res.status(404);
        throw new Error('Store not found');
    }


    const updatedStore = await Store.findByIdAndUpdate(req.params.id,
        {
            name,
            description,
            address
        },
        { new: true });

    console.log('updatedStore ..:', updatedStore);

    res.status(200).json(updatedStore);

});

module.exports = {
    createStore,
    getStores,
    updateStore,
    getStoresWithoutUser
};
