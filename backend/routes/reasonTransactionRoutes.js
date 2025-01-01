const express = require('express');
const router = express.Router();
const { createRT, getRTs } = require('../controllers/reasonTransactionController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createRT)
    .get(protect, getRTs);

module.exports = router;