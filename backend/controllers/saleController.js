const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const User = require('../models/userModel');
const Sale = require('../models/saleModel');
const Inventory = require('../models/inventoryModel');
const ReasonTransaction = require('../models/reasonTransactionModel');
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




    // CAMBIO: Obtener el motivo de transacción para VENTA desde la BD
    const saleReason = await ReasonTransaction.findOne({ code: 'SALE' });
    if (!saleReason) {
        res.status(400);
        throw new Error('No se encontró el motivo de transacción SALE. Debe ejecutar el seeder de motivos.');
    }

    // CAMBIO: Usar sesiones de MongoDB para garantizar atomicidad
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // 1. Crear la venta DENTRO de la sesión, con estado 'COMPLETED'
        const sale = await Sale.create([{
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
            status: 'COMPLETED',
            storeId: store,
            createdBy: req.id,
        }], { session });
        console.log('sale ..:', sale);

        if (!sale) {
            res.status(400);
            throw new Error('Error al crear la venta.');
        }

        for (const item of products) {
            // Obtener el stock actual del producto
            const productStock = await ProductStock.findOne({
                productId: item.productId,
                storeId: store
            }).session(session);

            if (!productStock) {
                throw new Error(`No se encontró stock para el producto ${item.productId}`);
            }

            const previousStock = productStock.stock;
            const newStock = previousStock - item.quantity;

            // VALIDACIÓN: Verificar que haya stock suficiente
            // De desactiva esta validación para permitir cualquier venta.
            //if (newStock < 0) {
            //    throw new Error(`Stock insuficiente para el producto ${item.code}. Stock actual: ${previousStock}, solicitado: ${item.quantity}`);
            //}
            if (newStock < 0) {
                console.warn(`Advertencia: Stock negativo para el producto ${item.productId}. Stock actual: ${previousStock}, solicitado: ${item.quantity}`);
                newStock = 0; // Evitar que el stock quede negativo
            }

            // Registrar movimiento de inventario (SALIDA/VENTA)
            // CAMBIO: Agregar previousStock, newStock y reasonTransactionId
            await Inventory.create([{
                productId: item.productId,
                transactionType: 'SALIDA',
                reasonTransactionId: saleReason._id, // CAMBIO: Usar ObjectId del motivo
                quantity: item.quantity,
                price: item.price,
                cost: productStock.averageCost || 0, // CAMBIO: Usar costo promedio actual
                previousStock, // CAMBIO: Stock antes de la venta
                newStock, // CAMBIO: Stock después de la venta
                document: sale.documentNumber,
                saleId: sale._id, // CAMBIO: Referenciar la venta
                storeId: store,
                transactionDate: new Date(),
                createdBy: req.id
            }], { session });

            // Actualizar el stock del producto
            productStock.stock = newStock;
            productStock.updatedBy = req.id;
            await productStock.save({ session });
        }

      

        // CONFIRMAR LA TRANSACCIÓN
        await session.commitTransaction();
        session.endSession();

        res.status(201).json(sale);

    } catch (error) {
        // REVERTIR LA TRANSACCIÓN EN CASO DE ERROR
        await session.abortTransaction();
        session.endSession();
        console.error('Error al procesar la venta:', error.message);
        res.status(400);
        throw error;
    }
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
