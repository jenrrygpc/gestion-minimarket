const express = require('express');
const router = express.Router();
const { createInventory } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createInventory);

module.exports = router;