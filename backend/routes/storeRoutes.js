const express = require('express');
const router = express.Router();
const {
    createStore,
    getStores,
    updateStore,
    getStoresWithoutUser } = require('../controllers/storeController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createStore)
    .get(protect, getStores);

router.route('/public')
    .get(getStoresWithoutUser);

router.route('/:id')
    .put(protect, updateStore);

module.exports = router;