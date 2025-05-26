const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateLogo,
  getBusinessLogos,
  getUserLogos,
  deleteLogo,
  regenerateLogo
} = require('../controllers/logoController');

// Log when routes are loaded
console.log('✅ Logo routes loaded');

// Generate a new logo
router.post('/generate', protect, generateLogo);

// Get all logos for the authenticated user
router.get('/user', protect, getUserLogos);

// Get logos for a specific business
router.get('/business/:businessId', protect, getBusinessLogos);

// Delete a specific logo
router.delete('/:logoId', protect, deleteLogo);

// Regenerate/create variations of an existing logo
router.post('/:logoId/regenerate', protect, regenerateLogo);

module.exports = router; 