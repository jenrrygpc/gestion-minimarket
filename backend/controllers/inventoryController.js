const asyncHandler = require('express-async-handler');

const User = require('../models/userModel.js');
const Inventory = require('../models/inventoryModel.js');
const ProductStock = require('../models/productStockModel.js');


// @desc    Create inventory
// @route   POST /api/inventories
// @access  Private
const createInventory = asyncHandler(async (req, res) => {

    const { payload: { store,
        transactionType,
        reasonTransaction,
        document, transactionDate,
        products } } = req.body;

    if (!products || !transactionType || !reasonTransaction) {
        res.status(400);
        throw new Error('Please include products, transactionType and reasonTransaction');
    }

    // Validate products
    const inventoryItems = products.map(product => {
        if (!product.productId || !product.quantity || !product.price) {
            res.status(400);
            throw new Error('Please include productId, quantity, and price for each product');
        }

        return {
            storeId: store,
            productId: product.productId,
            transactionType,
            reasonTransaction,
            quantity: product.quantity,
            price: product.price || 0,
            cost: product.cost || 0,
            document,
            transactionDate,
            createdBy: req.id
        };
    });

    const inventory = await Inventory.insertMany(inventoryItems);

    // Actualizar el stock por cada producto
    for (const item of inventoryItems) {
        const incValue = item.transactionType === 'ENTRADA' ? item.quantity : -item.quantity;
        await ProductStock.findOneAndUpdate(
            { productId: item.productId, storeId: item.storeId },
            { $inc: { stock: incValue } },
            { new: true, upsert: true }
        );
    }

    console.log('inventory ..:', inventory);

    res.status(201).json(inventory);

});

module.exports = {
    createInventory
};
