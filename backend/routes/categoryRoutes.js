const express = require('express');
const router = express.Router();
const { createCategory,
    getCategories,
    updateCategory } = require('../controllers/categoryController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createCategory)
    .get(protect, getCategories);

router.route('/:id')
    .put(protect, updateCategory);

module.exports = router;