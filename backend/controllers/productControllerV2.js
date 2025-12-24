const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const User = require('../models/userModel');
const Product = require('../models/productModelV2.js');
const Counter = require('../models/counterModel.js');
const Category = require('../models/categoryModel.js');
const ProductStock = require('../models/productStockModel.js');
const Inventory = require('../models/inventoryModel.js');
const ReasonTransaction = require('../models/reasonTransactionModel.js');


// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {

    const { payload: { code, measure,
        description, display, category,
        taxFree, discount, requiresParameter,
        price, cost, stock, minimumStock,
        store } } = req.body;

    if (!description || !price || !measure || !display || !category) {
        res.status(400);
        throw new Error('Por favor complete todos los campos obligatorios');
    }

    let finalCode = code;
    if (!finalCode) {
        finalCode = await getNextProductCode(category);
    }

    // Iniciar sesión para transacción atómica
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Crear producto maestro con basePrice/baseCost
        const product = await Product.create([{
            measure,
            code: finalCode,
            description,
            display,
            category,
            basePrice: price,
            baseCost: cost || 0,
            taxFree,
            discount,
            requiresParameter,
            createdBy: req.id,
        }], { session });

        console.log('product ..:', product[0]);

        if (!product || !product[0]) {
            throw new Error('Error al crear el producto');
        }

        const createdProduct = product[0];

        // Crear stock si se proporciona stock inicial
        if (stock && stock > 0) {
            // Crear registro de stock con precio de tienda y costos
            const productStock = await ProductStock.create([{
                productId: createdProduct._id,
                storeId: store,
                stock,
                minimumStock: minimumStock || 0,
                price, // Precio específico de la tienda
                averageCost: cost || 0, // Costo inicial es el costo de entrada
                lastCost: cost || 0, 
                createdBy: req.id
            }], { session });

            console.log('productStock ..:', productStock[0]);

            if (!productStock || !productStock[0]) {
                throw new Error('Error al crear el stock del producto');
            }

            // Buscar el motivo de transacción para inventario inicial
            const reasonInitial = await ReasonTransaction.findOne({
                code: 'INITIAL',
                transactionType: { $in: ['ENTRADA', 'AMBOS'] },
                enabled: true
            });

            if (!reasonInitial) {
                throw new Error('No se encontró el motivo de transacción para inventario inicial (código: INITIAL)');
            }

            // Registrar movimiento de inventario inicial con previousStock/newStock
            await Inventory.create([{
                storeId: store,
                productId: createdProduct._id,
                transactionType: 'ENTRADA',
                reasonTransactionId: reasonInitial._id, // Usar ObjectId en lugar de string
                quantity: stock,
                price: price,
                cost: cost || 0,
                previousStock: 0, // Stock anterior es 0 en inventario inicial
                newStock: stock, // Nuevo stock es la cantidad ingresada
                document: 'APERTURA',
                notes: 'Inventario inicial del producto',
                transactionDate: new Date(),
                createdBy: req.id
            }], { session });
        }

        // Confirmar transacción
        await session.commitTransaction();
        session.endSession();

        res.status(201).json(createdProduct);

    } catch (error) {
        // Revertir transacción en caso de error
        await session.abortTransaction();
        session.endSession();
        
        console.error('Error en createProduct:', error);
        res.status(400);
        throw error;
    }
});

// @desc    Update product
// @route   PUT /api/products
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {

    const { payload: { code, measure,
        description, display, category,
        price, cost, taxFree, discount,
        requiresParameter,
        stock, minimumStock, store } } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // IMPORTANTE: No permitir actualizar cost ni stock directamente
    // Estos valores solo se actualizan mediante movimientos de inventario
    if (typeof cost !== 'undefined' || typeof stock !== 'undefined') {
        console.warn('Intento de actualizar cost o stock ignorado. Use movimientos de inventario.');
    }

    // Actualizar producto maestro (solo campos permitidos)
    const updateData = {
        updatedBy: req.id,
    };

    // Solo actualizar campos que fueron enviados
    if (measure) updateData.measure = measure;
    if (code) updateData.code = code;
    if (description) updateData.description = description;
    if (display) updateData.display = display;
    if (category) updateData.category = category;
    if (typeof price !== 'undefined') updateData.basePrice = price; // Actualizar precio base
    if (typeof taxFree !== 'undefined') updateData.taxFree = taxFree;
    if (typeof discount !== 'undefined') updateData.discount = discount;
    if (typeof requiresParameter !== 'undefined') updateData.requiresParameter = requiresParameter;

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    );

    console.log('updatedProduct ..:', updatedProduct);

    // Actualizar ProductStock si se proporcionan price o minimumStock
    if (store && (typeof price !== 'undefined' || typeof minimumStock !== 'undefined')) {

        const existingStock = await ProductStock.findOne({
            productId: product._id,
            storeId: store
        });

        if (existingStock) {
            const stockUpdateData = {
                updatedBy: req.id
            };

            // Solo actualizar price y minimumStock
            // NUNCA actualizar: stock, averageCost, lastCost (se gestionan por inventario)
            if (typeof price !== 'undefined') stockUpdateData.price = price;
            if (typeof minimumStock !== 'undefined') stockUpdateData.minimumStock = minimumStock;

            await ProductStock.findOneAndUpdate(
                { productId: product._id, storeId: store },
                stockUpdateData,
                { new: true }
            );
            console.log(`Stock actualizado para producto ${product._id} en tienda ${store}`);
        } else {
            console.log(`No existe registro de stock para producto ${product._id} en tienda ${store}`);
            // Opcionalmente, podrías crear el stock aquí si no existe
        }
    }

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
    let productResponse;
    if (code) {
        const product = await Product.findOne({
            code: code,
        });
        // Buscar stock por tienda y producto
        if (product) {
            const productStock = await ProductStock.findOne({
                productId: product._id,
                storeId: store
            });
            productResponse = {
                _id: product._id,
                code: product.code,
                description: product.description,
                measure: product.measure,
                display: product.display,
                category: product.category,


                //price: product.price,
                // --- Lógica de Precios y Costos ---
                // Prioridad 1: Precio de la tienda. Prioridad 2: Precio base del producto.
                price: productStock?.price ?? product.basePrice ?? 0,
                //cost: product.cost,

                // Costos específicos de la tienda
                averageCost: productStock?.averageCost ?? 0,
                lastCost: productStock?.lastCost ?? 0,

                // Costo de referencia del producto maestro
                baseCost: product.baseCost ?? 0,


                taxFree: product.taxFree,
                discount: product.discount,
                requiresParameter: product.requiresParameter,


                enabled: product.enabled,
                stock: productStock?.stock ?? 0,
                minimumStock: productStock?.minimumStock ?? 0
            };
        }
    } else {
        productResponse = []
        const products = await Product.find({
            //store: store,
            description: new RegExp(description || '', 'i')
        })
            .limit(50)
            .sort({ updatedAt: -1 });

        console.log('products ..:', products);

        // Buscar stock por tienda y producto
        /*
        for (const product of products) {
            const productStock = await ProductStock.findOne({
                productId: product._id,
                storeId: store
            });

            console.log('productStock ..:', productStock);

            productResponse[productResponse.length] = {
                _id: product._id,
                code: product.code,
                description: product.description,
                display: product.display,
                category: product.category,
                price: product.price,
                cost: product.cost,
                taxFree: product.taxFree,
                discount: product.discount,
                requiresParameter: product.requiresParameter,
                measure: product.measure,
                enabled: product.enabled,
                stock: productStock ? productStock.stock || 0 : 0,
                minimumStock: productStock ? productStock.minimumStock || 0 : 0

            };

            console.log('productUpdated ..:', product);
        }
        */

        productResponse = await Promise.all(products.map(async (product) => {
            const productStock = await ProductStock.findOne({
                productId: product._id,
                storeId: store
            });

            console.log('productStock ..:', productStock);

            return {
                _id: product._id,
                code: product.code,
                description: product.description,
                display: product.display,
                category: product.category,
                //price: product.price,
                //cost: product.cost,
                taxFree: product.taxFree,
                discount: product.discount,
                requiresParameter: product.requiresParameter,
                measure: product.measure,
                enabled: product.enabled,
                //stock: productStock ? productStock.stock || 0 : 0,
                //minimumStock: productStock ? productStock.minimumStock || 0 : 0

                // --- Lógica de Precios y Costos ---
                price: productStock?.price ?? product.basePrice ?? 0,
                averageCost: productStock?.averageCost ?? 0,
                lastCost: productStock?.lastCost ?? 0,
                baseCost: product.baseCost ?? 0,
                stock: productStock?.stock ?? 0,
                minimumStock: productStock?.minimumStock ?? 0
            };
        }));
    }
    console.log('productResponse ..:', productResponse);

    res.status(200).json(productResponse);
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

async function getNextProductCode(categoryName) {
    // Busca la categoría para obtener el prefijo
    const category = await Category.findOne({ name: categoryName });
    if (!category || !category.prefix) throw new Error('Categoría o prefijo no encontrado');

    // Usa el nombre o el _id de la categoría como clave del counter
    const counter = await Counter.findOneAndUpdate(
        { key: categoryName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    // Genera el código: prefijo + correlativo (ej: 10 + 001)
    return Number(`${category.prefix}${String(counter.seq).padStart(3, '0')}`);
}


module.exports = {
    createProduct,
    updateProduct,
    updateProducts,
    getProduct
};
