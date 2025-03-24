const express = require('express');
const router = express.Router();
const {
    createPosShift,
    getPosShift,
    updatePosShift,
    getValidPosShift } = require('../controllers/posShiftController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createPosShift)
    .get(protect, getPosShift);

router.route('/valid')
    .get(protect, getValidPosShift);

router.route('/:id')
    .put(protect, updatePosShift);

module.exports = router;