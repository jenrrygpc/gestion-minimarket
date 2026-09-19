const express = require('express');
const router = express.Router();
const { createReasonTransaction,
    getReasonsTransaction,
    updateReasonTransaction } = require('../controllers/reasonTransactionController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('MOTIVOS_TRANSACCION_CREAR'), createReasonTransaction)
    .get(protect, authorize('MOTIVOS_TRANSACCION_VER'), getReasonsTransaction);

router.route('/:id')
    .put(protect, authorize('MOTIVOS_TRANSACCION_EDITAR'), updateReasonTransaction);

module.exports = router;