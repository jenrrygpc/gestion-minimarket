const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Role = require('../models/roleModel');

// @desc    Create role
// @route   POST /api/roles
// @access  Private
const createRole = asyncHandler(async (req, res) => {
    const { payload: {
        name,
        description,
        enabled,
        permissions
    } } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Incluir nombre');
    }

    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const role = await Role.create({
        name,
        description,
        enabled,
        permissions: permissions || []
    });

    if (!role) {
        res.status(400);
        throw new Error('Role validation failed');
    }

    console.log('role ..:', role);

    res.status(201).json(role);
});

// @desc    Get roles
// @route   GET /api/roles
// @access  Private
const getRoles = asyncHandler(async (req, res) => {
    console.log('getRoles ..:', req);
    const { name } = req.query;
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }
    let roles;
    if (name) {
        roles = await Role.find({ name: new RegExp(name, 'i') }).populate('permissions');
    } else {
        roles = await Role.find({}).populate('permissions');
    }

    console.log('roles ..:', roles);
    res.status(200).json(roles);
});

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private
const updateRole = asyncHandler(async (req, res) => {
    console.log('request updateRole ...:', req);
    const { payload: {
        name,
        description,
        enabled,
        permissions } } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
        res.status(404);
        throw new Error('Role not found');
    }

    const updatedRole = await Role.findByIdAndUpdate(req.params.id,
        {
            name,
            description,
            enabled,
            permissions
        },
        { new: true }).populate('permissions');

    console.log('updatedRole ..:', updatedRole);

    res.status(200).json(updatedRole);
});

module.exports = {
    createRole,
    getRoles,
    updateRole
};
