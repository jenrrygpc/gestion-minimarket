const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Category = require('../models/categoryModel');

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
    const { payload: { name,
        description, prefix } } = req.body;
    if (!name || !prefix) {
        res.status(400);
        throw new Error('Incluir nombre y prefijo');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const category = await Category.create({
        name,
        description,
        prefix,
        createdBy: req.id
    });


    if (!category) {
        res.status(400);
        throw new Error('Error al crear la categoría');
    }

    console.log('category ..:', category);

    res.status(201).json(category);
});


// @desc    Get categories
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getCategories ..:', req);
    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const categories = await Category.find();
    console.log('categories ..:', categories);
    res.status(200).json(categories);
});

const updateCategory = asyncHandler(async (req, res) => {
    const { payload: { description } } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Categoría no encontrada');
    }
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id,
        {
            description,
            updatedBy: req.id
        },
        { new: true });
    console.log('updatedCategory ..:', updatedCategory);
    res.status(200).json(updatedCategory);
});

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
};
