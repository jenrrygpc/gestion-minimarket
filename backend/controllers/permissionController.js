const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Permission = require('../models/permissionModel');

// @desc    Create permission
// @route   POST /api/permissions
// @access  Private
const createPermission = asyncHandler(async (req, res) => {
    const { payload: {
        code,
        module,
        type,
        description,
        enabled
    } } = req.body;
    if (!code || !module) {
        res.status(400);
        throw new Error('Incluir code y module');
    }

    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
    }

    const permission = await Permission.create({
        code,
        module,
        type,
        description,
        enabled
    });

    if (!permission) {
        res.status(400);
        throw new Error('Permission validation failed');
    }

    console.log('permission ..:', permission);

    res.status(201).json(permission);
});

// @desc    Get permissions
// @route   GET /api/permissions
// @access  Private
const getPermissions = asyncHandler(async (req, res) => {
    console.log('getPermissions ..:', req);
    const { module, code } = req.query;
    const user = await User.findById(req.id);
    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }
    const filter = {};
    if (module) {
        filter.module = module;
    }
    if (code) {
        filter.code = new RegExp(code, 'i');
    }
    const permissions = await Permission.find(filter);

    console.log('permissions ..:', permissions);
    res.status(200).json(permissions);
});

module.exports = {
    createPermission,
    getPermissions
};
