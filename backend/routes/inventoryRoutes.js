const express = require('express');
const router = express.Router();
const { createInventory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('INVENTARIO_CREAR'), createInventory);

module.exports = router;