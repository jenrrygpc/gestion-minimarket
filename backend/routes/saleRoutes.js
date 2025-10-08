const express = require('express');
const router = express.Router();
const {
    createSale,
    updateSale } = require('../controllers/saleController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createSale);

router.route('/:id')
    .put(protect, updateSale);

module.exports = router;