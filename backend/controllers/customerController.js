const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Customer = require('../models/customerModel');

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
    const { payload: {
        documentNumber,
        names,
        email,
        address,
        cellphone
    } } = req.body;
    if (!documentNumber) {
        res.status(400);
        throw new Error('Incluir número de documento');
    }
    if (!names) {
        res.status(400);
        throw new Error('Incluir nombres');
    }

    // Get user using the id  the JWT
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const customer = await Customer.create({
        documentNumber,
        names,
        email,
        address,
        cellphone,        
        user: req.id
    });
    console.log('customer ..:', customer);

    if (!customer) {
        res.status(400);
        throw new Error('Error al crear Cliente');
    }

    res.status(201).json(customer);
});


// @desc    Get customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
    // Get user using the id  the JWT
    console.log('getCustomers ..:', req);
    const { documentNumber, names } = req.query;
    const user = await User.findById(req.id);
    console.log('user ..:', user);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }
    let customers;
    if (documentNumber) {
        customers = await Customer.find({
            documentNumber
        });
    } else if (names) {
        customers = await Customer.find({
            names: new RegExp(names, 'i')
        });
    } else {
        customers = await Customer.find()
        .limit(50)
        .sort({ updatedAt: -1 });
    }

    console.log('customers ..:', customers);
    res.status(200).json(customers);
});


// @desc    Update customer
// @route   PUT /api/customer
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
    console.log('request updateCustomer ...:', req);
    const { payload: {
        documentNumber,
        names,
        email,
        address,
        cellphone } } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id,
        {
            documentNumber,
            names,
            email,
            address,
            cellphone,
        },
        { new: true });

    console.log('updatedCustomer ..:', updatedCustomer);

    res.status(200).json(updatedCustomer);

});

module.exports = {
    createCustomer,
    getCustomers,
    updateCustomer
};
