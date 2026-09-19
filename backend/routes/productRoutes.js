const express = require('express');
const router = express.Router();
const {
  createProduct,
  updateProduct,
  updateProducts,
  getProduct } = require('../controllers/productControllerV2');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('PRODUCTOS_CREAR'), createProduct)
  .get(protect, authorize('PRODUCTOS_VER'), getProduct);

router.route('/:id')
  .put(protect, authorize('PRODUCTOS_EDITAR'), updateProduct);

router.route('/update-stock')
  .patch(protect, authorize('PRODUCTOS_EDITAR'), updateProducts);

module.exports = router;