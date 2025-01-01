const asyncHandler = require('express-async-handler');

const User = require('../models/userModel.js');
const Inventory = require('../models/inventoryModel.js');


// @desc    Create inventory
// @route   POST /api/inventories
// @access  Private
const createInventory = asyncHandler(async (req, res) => {

    const { payload: { store,
        transactionType,
        reason,
        document, transactionDate,
        products } } = req.body;

    if (!products || !transactionType || !reason) {
        res.status(400);
        throw new Error('Please include products, transactionType and reason');
    }

    // Validate products
    const inventoryItems = products.map(product => {
        if (!product.productId || !product.quantity || !product.price) {
            res.status(400);
            throw new Error('Please include productId, quantity, and price for each product');
        }

        return {
            store,
            product: product.productId,
            transactionType,
            reason,
            quantity: product.quantity,
            price: product.price || 0,
            cost: product.cost || 0,
            document,
            transactionDate,
            user: req.id
        };
    });

    const inventory = await Inventory.insertMany(inventoryItems);

    console.log('inventory ..:', inventory);

    res.status(201).json(inventory);

    //validar productos
    /*
    const inventory = await Inventory.create({
        store,
        product,
        transactionType,
        reason,
        quantity,
        price,
        cost,
        document,
        transactionDate,
        user: req.id,
    });

    console.log('inventory ..:', inventory);

    if (!inventory) {
        res.status(400);
        throw new Error('Inventory validation failed');
    }

    res.status(201).json(inventory);
    */
});

module.exports = {
    createInventory
};
