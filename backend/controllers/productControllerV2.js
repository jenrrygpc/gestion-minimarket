const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Product = require('../models/productModelV2.js');


// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {

    const { payload: { measure, store,
        code, description, display,
        category, price, stock,
        minimumStock, taxFree, discount,
        requiresParameter } } = req.body;

    if (!measure || !store || !code || !description || !price) {
        res.status(400);
        throw new Error('Please include measure, store, code, description and price');
    }

    const product = await Product.create({
        measure,
        store,
        code,
        description,
        display,
        category,
        price,
        stock,
        minimumStock,
        taxFree,
        discount,
        requiresParameter,
        user: req.id,
    });

    console.log('product ..:', product);

    if (!product) {
        res.status(400);
        throw new Error('Product validation failed');
    }

    res.status(201).json(product);
});

// @desc    Update product
// @route   PUT /api/products
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {

    const { payload: { measure, code,
        description, display, category,
        price, minimumStock, taxFree,
        discount, requiresParameter,
        enabled } } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }


    const updatedProduct = await Product.findByIdAndUpdate(req.params.id,
        {
            measure,
            code,
            description,
            display,
            category,
            price,
            minimumStock,
            taxFree,
            discount,
            requiresParameter,
            enabled
        },
        { new: true });

    console.log('updatedProduct ..:', updatedProduct);

    res.status(200).json(updatedProduct);

});

// @desc    Get product
// @route   GET /api/product/
// @query   req.query.*
// @access  Private
const getProduct = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('req getProduct ..:', req);
    const { query: { code, description, store } } = req;
    let product;
    if (code) {
        product = await Product.findOne({
            store: store,
            code: code,
        });
    } else {
        product = await Product.find({
            store: store,
            description: new RegExp(description || '', 'i')
        })
            .limit(50)
            .sort({ updatedAt: -1 });
    }
    console.log('product ..:', product);

    res.status(200).json(product);
});

const updateProducts = asyncHandler(async (req, res) => {

    console.log('updateProducts ..:', req.body);

    const { payload: products } = req.body;

    const updateProducts = [];
    for (const product of products) {
        const { id, quantity, price, cost } = product;
        const productFound = await Product.findById(id);

        if (productFound) {
            const updatedProduct = await Product.findByIdAndUpdate(id,
                {
                    stock: productFound.stock + quantity,
                    price,
                    cost,
                    updatedUser: req.id
                },
                {
                    new: true
                });
            updateProducts[updateProducts.length] = updatedProduct;
        } else {
            console.log('Product not found ..:', id);
        }
    }
    res.status(200).json({ payload: updateProducts });
});


module.exports = {
    createProduct,
    updateProduct,
    updateProducts,
    getProduct
};
