const express = require('express');
const router = express.Router();
const {
    createRole,
    getRoles,
    updateRole } = require('../controllers/roleController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('ROLES_CREAR'), createRole)
    .get(protect, authorize('ROLES_VER'), getRoles);

router.route('/:id')
    .put(protect, authorize('ROLES_EDITAR'), updateRole);

module.exports = router;
