const express = require('express');
const router = express.Router();
const {
    createPos,
    getPos,
    updatePos,
    getAvailablePos
} = require('../controllers/posController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createPos)
    .get(protect, getPos);

router.route('/available')
    .get(protect, getAvailablePos);

router.route('/:id')
    .put(protect, updatePos);

module.exports = router;