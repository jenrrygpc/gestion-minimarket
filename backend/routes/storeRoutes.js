const express = require('express');
const router = express.Router();
const {
    createStore,
    getStores,
    updateStore,
    getStoresWithoutUser } = require('../controllers/storeController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('TIENDAS_CREAR'), createStore)
    .get(protect, authorize('TIENDAS_VER'), getStores);

router.route('/public')
    .get(getStoresWithoutUser);

router.route('/:id')
    .put(protect, authorize('TIENDAS_EDITAR'), updateStore);

module.exports = router;