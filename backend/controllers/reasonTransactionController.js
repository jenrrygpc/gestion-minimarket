const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const ReasonTransaction = require('../models/reasonTransactionModel');

// @desc    Create reason transaction
// @route   POST /api/reasons-transaction
// @access  Private
const createReasonTransaction = asyncHandler(async (req, res) => {
    const { payload: {
        code,
        name,
        description,
        transactionType,
        affectsCost,
        requiresDocument,
        enabled
    } } = req.body;
    if (!code || !name || !transactionType) {
        res.status(400);
        throw new Error('Incluir código, nombre y tipo de transacción');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const reasonTransaction = await ReasonTransaction.create({
        code,
        name,
        description,
        transactionType,
        affectsCost,
        requiresDocument,
        enabled,
        createdBy: req.id
    });


    if (!reasonTransaction) {
        res.status(400);
        throw new Error('ReasonTransaction validation failed');
    }

    console.log('reasonTransaction ..:', reasonTransaction);

    res.status(201).json(reasonTransaction);
});


// @desc    Get reasons transaction
// @route   GET /api/reasons-transaction
// @access  Private
const getReasonsTransaction = asyncHandler(async (req, res) => {
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

const updateReasonTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { payload: {
        code,
        name,
        description,
        transactionType,
        affectsCost,
        requiresDocument,
        enabled } } = req.body;

    const reasonTransaction = await ReasonTransaction.findByIdAndUpdate(id, {
        code,
        name,
        description,
        transactionType,
        affectsCost,
        requiresDocument,
        enabled,
        updatedBy: req.id
    }, { new: true });

    if (!reasonTransaction) {
        res.status(404);
        throw new Error('ReasonTransaction not found');
    }

    res.status(200).json(reasonTransaction);
});

module.exports = {
    createReasonTransaction,
    getReasonsTransaction,
    updateReasonTransaction
};
