const express = require('express');
const router = express.Router();
const {
    createPos,
    getPos,
    updatePos } = require('../controllers/posController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createPos)
    .get(protect, getPos);

router.route('/:id')
    .put(protect, updatePos);

module.exports = router;