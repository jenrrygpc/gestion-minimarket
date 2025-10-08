const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Product = require('../models/productModelV2.js');
const Counter = require('../models/counterModel.js');
const Category = require('../models/categoryModel.js');
const ProductStock = require('../models/productStockModel.js');
const Inventory = require('../models/inventoryModel.js')


// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {

    const { payload: { code, measure,
        description, display, category,
        price, cost, taxFree, discount,
        requiresParameter,
        stock, minimumStock, store } } = req.body;

    if (!description || !price || !measure || !display || !category) {
        res.status(400);
        throw new Error('Por favor complete todos los campos obligatorios');
    }

    let finalCode = code;
    if (!finalCode) {
        finalCode = await getNextProductCode(category);
    }



    const product = await Product.create({
        measure,
        code: finalCode,
        description,
        display,
        category,
        price,
        cost,
        taxFree,
        discount,
        requiresParameter,
        createdBy: req.id,
    });

    console.log('product ..:', product);

    if (!product) {
        res.status(400);
        throw new Error('Error al crear el producto');
    }

    if (stock && stock > 0) {
        // Create initial stock record
        const productStock = await ProductStock.create({
            productId: product._id,
            storeId: store,
            stock,
            minimumStock: minimumStock || 0,
            createdBy: req.id
        });

        console.log('productStock ..:', productStock);

        if (!productStock) {
            res.status(400);
            throw new Error('Error al crear el stock del producto');
        }

        // Registrar movimiento de inventario inicial
        await Inventory.create({
            storeId: store,
            productId: product._id,
            transactionType: 'ENTRADA',
            reasonTransaction: 'Inventario Inicial',
            quantity: stock,
            price: price,
            cost: cost || 0,
            document: 'APERTURA',
            transactionDate: new Date(),
            createdBy: req.id
        });

    }

    res.status(201).json(product);
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

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id,
        {
            measure,
            code,
            description,
            display,
            category,
            price,
            cost,
            taxFree,
            discount,
            requiresParameter,
            updatedBy: req.id,
        },
        { new: true });

    console.log('updatedProduct ..:', updatedProduct);

    // Si se envió minimumStock y store, actualizar en ProductStock
    if (typeof minimumStock !== 'undefined' && store) {

        const existingStock = await ProductStock.findOne({
            productId: product._id,
            storeId: store
        });

        if (existingStock) {
            await ProductStock.findOneAndUpdate(
                { productId: product._id, storeId: store },
                { minimumStock: minimumStock },
                { new: true }
            );
            console.log(`Stock mínimo actualizado para producto ${product._id} en tienda ${store}`);
        } else {
            console.log(`No existe registro de stock para producto ${product._id} en tienda ${store}`);
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

            return {
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
