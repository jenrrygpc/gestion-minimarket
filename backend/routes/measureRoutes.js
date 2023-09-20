const express = require('express');
const router = express.Router();
const { createMeasure, getMeasures } = require('../controllers/measureController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createMeasure)
    .get(protect, getMeasures);

module.exports = router;