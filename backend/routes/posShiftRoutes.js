const express = require('express');
const router = express.Router();
const {
    createPosShift,
    getPosShift,
    updatePosShift,
    getValidPosShift,
    closePosShift,
    getPreClosingSummary
} = require('../controllers/posShiftController');

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createPosShift)
    .get(protect, getPosShift);

router.route('/valid')
    .get(protect, getValidPosShift);


router.route('/close')
    .post(protect, closePosShift);

router.route('/:id')
    .put(protect, updatePosShift);

router.route('/summary/:posShiftId')
    .get(protect, getPreClosingSummary);

module.exports = router;