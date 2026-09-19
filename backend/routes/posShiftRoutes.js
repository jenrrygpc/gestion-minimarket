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

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('TURNOS_CREAR'), createPosShift)
    .get(protect, authorize('TURNOS_VER'), getPosShift);

router.route('/valid')
    .get(protect, authorize('TURNOS_VER'), getValidPosShift);


router.route('/close')
    .post(protect, authorize('TURNOS_EDITAR'), closePosShift);

router.route('/:id')
    .put(protect, authorize('TURNOS_EDITAR'), updatePosShift);

router.route('/summary/:posShiftId')
    .get(protect, authorize('TURNOS_VER'), getPreClosingSummary);

module.exports = router;