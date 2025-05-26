const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Log when routes are loaded
console.log('✅ User routes loaded');

// If you have a controller
const { getUserProfile } = require('../controllers/userController');

// Protected route to get user profile
router.get('/me', protect, getUserProfile);

// Example of correct router.use() with a handler function
// This would apply middleware to all routes in this file
router.use('/profile', protect, (req, res, next) => {
  console.log('Profile route accessed');
  next();
});

// A sample profile route that uses the middleware above
router.get('/profile', (req, res) => {
  res.json({ message: 'Profile data', user: req.user });
});

module.exports = router;