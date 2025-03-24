const express = require('express');
const router = express.Router();
const {
  createProduct,
  updateProduct,
  updateProducts,
  getProduct } = require('../controllers/productControllerV2');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createProduct)
  .get(protect, getProduct);

router.route('/:id')
  .put(protect, updateProduct);

router.route('/update-stock')
  .patch(protect, updateProducts);

module.exports = router;