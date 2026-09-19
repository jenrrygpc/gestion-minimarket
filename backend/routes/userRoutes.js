const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers, updateUser } = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('USUARIOS_CREAR'), registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/', protect, authorize('USUARIOS_VER'), getUsers);
router.route('/:id')
  .put(protect, authorize('USUARIOS_EDITAR'), updateUser);


module.exports = router;
