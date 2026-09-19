const express = require('express');
const router = express.Router();
const {
    createPos,
    getPos,
    updatePos,
    getAvailablePos
} = require('../controllers/posController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('POS_CREAR'), createPos)
    .get(protect, authorize('POS_VER'), getPos);

router.route('/available')
    .get(protect, authorize('POS_VER'), getAvailablePos);

router.route('/:id')
    .put(protect, authorize('POS_EDITAR'), updatePos);

module.exports = router;