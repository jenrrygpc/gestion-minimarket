const express = require('express');
const router = express.Router();
const {
    createSale,
    updateSale } = require('../controllers/saleController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('VENTAS_CREAR'), createSale);

router.route('/:id')
    .put(protect, authorize('VENTAS_EDITAR'), updateSale);

module.exports = router;