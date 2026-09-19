const express = require('express');
const router = express.Router();
const { createMeasure, getMeasures } = require('../controllers/measureController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('MEDIDAS_CREAR'), createMeasure)
    .get(protect, authorize('MEDIDAS_VER'), getMeasures);

module.exports = router;