const express = require('express');
const router = express.Router();
const {
    createMaster,
    getMasters,
    updateMaster } = require('../controllers/masterController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createMaster)
    .get(protect, getMasters);

router.route('/:id')
    .put(protect, updateMaster);

module.exports = router;