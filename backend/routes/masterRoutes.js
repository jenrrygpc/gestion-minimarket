const express = require('express');
const router = express.Router();
const {
    createMaster,
    getMasters,
    updateMaster } = require('../controllers/masterController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('MAESTROS_CREAR'), createMaster)
    .get(protect, authorize('MAESTROS_VER'), getMasters);

router.route('/:id')
    .put(protect, authorize('MAESTROS_EDITAR'), updateMaster);

module.exports = router;