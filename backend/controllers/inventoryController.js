const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const User = require('../models/userModel.js');
const Inventory = require('../models/inventoryModel.js');
const ProductStock = require('../models/productStockModel.js');
const ReasonTransaction = require('../models/reasonTransactionModel.js');


// @desc    Create inventory
// @route   POST /api/inventories
// @access  Private
const createInventory = asyncHandler(async (req, res) => {

    const { payload: { store,
        transactionType,
        reasonTransactionId,
        document, transactionDate,
        products } } = req.body;

    // VALIDACIÓN 1: Verificar campos requeridos
    if (!products || !transactionType || !reasonTransactionId) {
        res.status(400);
        throw new Error('Incluir productos, tipo de transacción y motivo de transacción');
    }

    // VALIDACIÓN 2: Verificar que reasonTransactionId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(reasonTransactionId)) {
        res.status(400);
        throw new Error('El motivo de transacción no es válido');
    }

    // VALIDACIÓN 3: Verificar que el motivo de transacción exista y sea compatible
    const reasonTransaction = await ReasonTransaction.findById(reasonTransactionId);
    if (!reasonTransaction) {
        res.status(404);
        throw new Error('El motivo de transacción no existe');
    }

    // VALIDACIÓN 4: Verificar que el tipo de transacción sea compatible con el motivo
    if (reasonTransaction.transactionType !== transactionType && reasonTransaction.transactionType !== 'AMBOS') {
        res.status(400);
        throw new Error(`El motivo ${reasonTransaction.name} no es válido para ${transactionType}`);
    }

    // VALIDACIÓN 5: Verificar documento si es requerido
    if (reasonTransaction.requiresDocument && !document) {
        res.status(400);
        throw new Error(`El motivo ${reasonTransaction.name} requiere número de documento`);
    }

    // INICIAR SESIÓN DE MONGODB para garantizar atomicidad
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const inventoryItems = [];

        // PROCESAR CADA PRODUCTO
        for (const product of products) {
            // VALIDACIÓN 6: Verificar campos del producto
            if (!product.productId || !product.quantity || !product.price) {
                throw new Error('Cada producto debe incluir productId, quantity y price');
            }

            // VALIDACIÓN 7: Verificar que quantity, price y cost sean números positivos
            const quantity = Number(product.quantity);
            const price = Number(product.price);
            const cost = Number(product.cost) || 0;

            if (isNaN(quantity) || quantity <= 0) {
                throw new Error(`La cantidad del producto ${product.productId} debe ser mayor a 0`);
            }

            if (isNaN(price) || price <= 0) {
                throw new Error(`El precio del producto ${product.productId} debe ser mayor a 0`);
            }

            if (isNaN(cost) || cost < 0) {
                throw new Error(`El costo del producto ${product.productId} no puede ser negativo`);
            }

            if (cost > price) {
                throw new Error(`El costo del producto ${product.productId} no puede ser mayor al precio`);
            }

            // OBTENER O CREAR EL STOCK DEL PRODUCTO
            let productStock = await ProductStock.findOne(
                { productId: product.productId, storeId: store }
            ).session(session);

            if (!productStock) {
                // CREAR STOCK INICIAL si no existe
                productStock = new ProductStock({
                    productId: product.productId,
                    storeId: store,
                    stock: 0,
                    price: price,
                    averageCost: 0,
                    lastCost: 0,
                    createdBy: req.id
                });
            }

            const previousStock = productStock.stock;
            let newStock = previousStock;
            let newAverageCost = productStock.averageCost;
            let newLastCost = productStock.lastCost;

            // LÓGICA SEGÚN TIPO DE TRANSACCIÓN
            if (transactionType === 'ENTRADA') {
                // ENTRADA: Incrementar stock
                newStock = previousStock + quantity;

                // CALCULAR NUEVO COSTO PROMEDIO solo si affectsCost es true
                if (reasonTransaction.affectsCost && cost > 0) {
                    const totalCostBefore = previousStock * productStock.averageCost;
                    const totalCostNew = quantity * cost;
                    newAverageCost = (totalCostBefore + totalCostNew) / newStock;
                    newLastCost = cost;
                }

            } else if (transactionType === 'SALIDA') {
                // SALIDA: Decrementar stock
                // VALIDACIÓN 8: Verificar que haya stock suficiente
                if (previousStock < quantity) {
                    throw new Error(`Stock insuficiente para el producto ${product.productId}. Stock actual: ${previousStock}, solicitado: ${quantity}`);
                }
                newStock = previousStock - quantity;
            }

            // ACTUALIZAR EL STOCK DEL PRODUCTO
            productStock.stock = newStock;
            productStock.price = price;
            productStock.averageCost = newAverageCost;
            productStock.lastCost = newLastCost;
            productStock.updatedBy = req.id;
            await productStock.save({ session });

            // CREAR REGISTRO DE INVENTARIO
            const inventoryItem = {
                storeId: store,
                productId: product.productId,
                transactionType,
                reasonTransactionId,
                quantity,
                price,
                cost,
                previousStock,
                newStock,
                document,
                transactionDate: transactionDate || new Date(),
                createdBy: req.id
            };

            inventoryItems.push(inventoryItem);
        }

        // INSERTAR TODOS LOS REGISTROS DE INVENTARIO
        const inventory = await Inventory.insertMany(inventoryItems, { session });

        // CONFIRMAR LA TRANSACCIÓN
        await session.commitTransaction();
        session.endSession();

        console.log('inventory creado exitosamente ..:', inventory.length, 'registros');

        res.status(201).json({
            success: true,
            message: 'Inventario registrado exitosamente',
            count: inventory.length,
            data: inventory
        });

    } catch (error) {
        // REVERTIR LA TRANSACCIÓN EN CASO DE ERROR
        await session.abortTransaction();
        session.endSession();
        console.error('Error al crear inventario:', error.message);
        res.status(400);
        throw error;
    }

});

module.exports = {
    createInventory
};
