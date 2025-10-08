const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Sale = require('../models/saleModel');
const Inventory = require('../models/inventoryModel');
//const Product = require('../models/productModelV2');
const ProductStock = require('../models/productStockModel');
const Counter = require('../models/counterModel');

// @desc    Create sale
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
    const { payload: {
        documentType,
        posShiftId,
        customerId,
        customer,
        products,
        subtotalAmount,
        totalAmount,
        taxAmount,
        changeAmount,
        payments,
        store
    } } = req.body;

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    // 1. Define la serie según el tipo de documento
    let serie = '';
    if (documentType === 'BOLETA') serie = 'B001';
    else if (documentType === 'FACTURA') serie = 'F001';
    else if (documentType === 'TICKET') serie = 'T001';

    const key = `${documentType}-${serie}`;

    const counter = await Counter.findOneAndUpdate(
        { key },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const correlativo = counter.seq;
    const documentNumber = `${serie}-${correlativo.toString().padStart(6, '0')}`;


    // Crea la venta
    const sale = await Sale.create({
        documentType,
        documentNumber,
        serie,
        correlativo,
        posShiftId,
        customerId,
        customer,
        products,
        subtotalAmount,
        totalAmount,
        taxAmount,
        changeAmount,
        payments,
        status: 'REGISTERED', // Estado inicial
        storeId: store,
        createdBy: req.id,
        //updatedBy: req.id
    });
    console.log('sale ..:', sale);

    if (!sale) {
        res.status(400);
        throw new Error('Error al crear la venta.');
    }

    for (const item of products) {
        // 1. Registrar movimiento de inventario (SALIDA/VENTA)
        await Inventory.create({
            productId: item.productId,
            transactionType: 'SALIDA',
            reasonTransaction: 'Venta',
            quantity: item.quantity,
            price: item.price,
            document: sale.documentNumber,
            user: req.id,
            storeId: store,
            transactionDate: new Date(),
            createdBy: req.id
        });

        // 2. Actualizar el stock del producto
        await ProductStock.findOneAndUpdate(
            {
                productId: item.productId,
                storeId: store

            },
            {
                $inc: { stock: -item.quantity },
                updatedBy: req.id
            }
        );
    }

    await Sale.findByIdAndUpdate(sale._id, {
        status: 'COMPLETED',
        updatedBy: req.id
    }, { new: true }
    )

    res.status(201).json(sale);
});


// @desc    Update sale
// @route   PUT /api/sales
// @access  Private
const updateSale = asyncHandler(async (req, res) => {
    console.log('request updateSale ...:', req);
    const { payload: {
        status,
        enabled } } = req.body;

    const sale = await Sale.findById(req.params.id);

    if (!sale) {
        res.status(404);
        throw new Error('Venta no encontrada');
    }

    const updatedSale = await Sale.findByIdAndUpdate(req.params.id,
        {
            status,
            enabled,
        },
        { new: true });

    console.log('updatedSale ..:', updatedSale);

    res.status(200).json(updatedSale);

});

const getSale = asyncHandler(async (req, res) => {
    const { query: { documentNumber, store } } = req;


    const sale = await Sale.findOne({
        store: store,
        documentNumber: documentNumber,
    });

    if (!sale) {
        res.status(404);
        throw new Error('No se encontró la venta');
    }

    console.log('sale ..:', sale);


    res.status(200).json(sale);
}
);

module.exports = {
    createSale,
    updateSale,
    getSale
};
