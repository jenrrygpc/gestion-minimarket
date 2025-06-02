const express = require('express');
const router = express.Router();
const {
    createCustomer,
    getCustomers,
    updateCustomer } = require('../controllers/customerController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createCustomer)
    .get(protect, getCustomers);

router.route('/:id')
    .put(protect, updateCustomer);

module.exports = router;