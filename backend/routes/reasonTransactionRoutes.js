const express = require('express');
const router = express.Router();
const { createReasonTransaction,
    getReasonsTransaction,
    updateReasonTransaction } = require('../controllers/reasonTransactionController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createReasonTransaction)
    .get(protect, getReasonsTransaction);

router.route('/:id')
    .put(protect, updateReasonTransaction);

module.exports = router;