const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  uploadMedia,
  getUserMedia,
  deleteMedia
} = require('../controllers/mediaController');

// Log when routes are loaded
console.log('✅ Media routes loaded');

// Media routes
router.route('/')
  .get(protect, getUserMedia)
  .post(protect, uploadMedia);

router.route('/:id')
  .delete(protect, deleteMedia);

module.exports = router;