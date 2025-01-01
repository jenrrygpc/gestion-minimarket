const express = require('express');
const router = express.Router();
const { createProfile, getProfiles } = require('../controllers/profileController')

const { protect } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createProfile)
    .get(protect, getProfiles);

module.exports = router;