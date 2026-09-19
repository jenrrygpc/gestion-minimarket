const express = require('express');
const router = express.Router();
const {
    createPermission,
    getPermissions } = require('../controllers/permissionController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('PERMISOS_CREAR'), createPermission)
    .get(protect, authorize('PERMISOS_VER'), getPermissions);

module.exports = router;
