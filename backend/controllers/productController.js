const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const ProductSale = require('../models/productSaleModel');

// @desc    Create user ticket
// @route   POST /api/tickets
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    const { payload: { productCode, code,
        description, presentation, category,
        brand, measure, price, stock,
        minimumStock, taxExempt, discount,
        requiresParameter } } = req.body;
    if (!code || !description || !measure || !price) {
        res.status(400);
        throw new Error('Please include code, description, measure and price');
    }


    let product;

    if (!productCode) {
        product = await Product.create({
            description,
            user: req.id,
            presentation,
            category,
            brand
        });
    }
    console.log('product ..:', product);

    const productSale = await ProductSale.create({
        product: product._id,
        code,
        description,
        user: req.id,
        measure,
        price,
        stock,
        minimumStock,
        taxExempt,
        discount,
        requiresParameter
    });

    if (!productSale) {
        res.status(400);
        throw new Error('Product validation failed');
    }

    console.log('productSale ..:', productSale);

    res.status(201).json(productSale);
});

// @desc    Update product
// @route   PUT /api/products
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    console.log('request updateProduct ...:', req);
    const { payload: {
        description, measure, price, stock,
        minimumStock, taxExempt, discount,
        requiresParameter } } = req.body;
    if (!description || !measure || !price) {
        res.status(400);
        throw new Error('Please include description, measure and price');
    }

    const productSale = await ProductSale.findById(req.params.id);

    if (!productSale) {
        res.status(404);
        throw new Error('Product not found');
    }


    const updatedProduct = await ProductSale.findByIdAndUpdate(req.params.id,
        {
            description,
            measure,
            price,
            stock,
            minimumStock,
            taxExempt,
            discount,
            requiresParameter
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
    let productSale;
    if (req.query.code) {
        productSale = await ProductSale.findOne({ code: req.query.code })
        if (!productSale) {
            res.status(404);
            throw new Error('Producto para venta no disponible');
        }
    } else if (req.query.description) {
        productSale = await ProductSale.find({ description: new RegExp(req.query.description, 'i') });
    }
    console.log('productSale ..:', productSale);

    res.status(200).json(productSale);
});


module.exports = {
    createProduct,
    updateProduct,
    getProduct
};
