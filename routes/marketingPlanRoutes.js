const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMarketingPlans,
  createMarketingPlan,
  getMarketingPlan,
  updateMarketingPlan,
  deleteMarketingPlan
} = require('../controllers/marketingPlanController');

router.route('/')
  .get(protect, getMarketingPlans)
  .post(protect, createMarketingPlan);

router.route('/:id')
  .get(protect, getMarketingPlan)
  .put(protect, updateMarketingPlan)
  .delete(protect, deleteMarketingPlan);

module.exports = router;