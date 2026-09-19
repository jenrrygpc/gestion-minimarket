const express = require('express');
const router = express.Router();
const {
    createCustomer,
    getCustomers,
    updateCustomer } = require('../controllers/customerController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('CLIENTES_CREAR'), createCustomer)
    .get(protect, authorize('CLIENTES_VER'), getCustomers);

router.route('/:id')
    .put(protect, authorize('CLIENTES_EDITAR'), updateCustomer);

module.exports = router;