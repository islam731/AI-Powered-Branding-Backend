const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getBusinesses,
  createBusiness,
  getBusiness,
  updateBusiness,
  deleteBusiness
} = require('../controllers/businessController');

router.route('/')
  .get(protect, getBusinesses)
  .post(protect, createBusiness);

router.route('/:id')
  .get(protect, getBusiness)
  .put(protect, updateBusiness)
  .delete(protect, deleteBusiness);

  

module.exports = router;