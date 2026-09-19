const express = require('express');
const router = express.Router();
const { createCategory,
    getCategories,
    updateCategory } = require('../controllers/categoryController')

const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, authorize('CATEGORIAS_CREAR'), createCategory)
    .get(protect, authorize('CATEGORIAS_VER'), getCategories);

router.route('/:id')
    .put(protect, authorize('CATEGORIAS_EDITAR'), updateCategory);

module.exports = router;