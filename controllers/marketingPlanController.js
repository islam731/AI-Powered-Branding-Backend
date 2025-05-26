const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all marketing plans for a business
const getMarketingPlans = async (req, res) => {
  try {
    const { businessId } = req.query;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    // Verify business belongs to user
    const business = await prisma.business.findFirst({
      where: {
        id: parseInt(businessId),
        userId: req.user.id
      }
    });
    
    if (!business) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to business'
      });
    }

    const marketingPlans = await prisma.marketingPlan.findMany({
      where: {
        businessId: parseInt(businessId),
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: marketingPlans
    });
  } catch (error) {
    console.error('Error fetching marketing plans:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create a marketing plan
const createMarketingPlan = async (req, res) => {
  try {
    const { content, businessId } = req.body;

    if (!content || !businessId) {
      return res.status(400).json({
        success: false,
        message: 'Content and businessId are required'
      });
    }

    // Verify business belongs to user
    const business = await prisma.business.findFirst({
      where: {
        id: parseInt(businessId),
        userId: req.user.id
      }
    });
    
    if (!business) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to business'
      });
    }

    const marketingPlan = await prisma.marketingPlan.create({
      data: {
        content,
        userId: req.user.id,
        businessId: parseInt(businessId)
      }
    });

    res.status(201).json({
      success: true,
      data: marketingPlan
    });
  } catch (error) {
    console.error('Error creating marketing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get a single marketing plan
const getMarketingPlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const marketingPlan = await prisma.marketingPlan.findUnique({
      where: { id }
    });

    if (!marketingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Marketing plan not found'
      });
    }

    // Check if the plan belongs to the user
    if (marketingPlan.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to marketing plan'
      });
    }

    res.status(200).json({
      success: true,
      data: marketingPlan
    });
  } catch (error) {
    console.error('Error fetching marketing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update a marketing plan
const updateMarketingPlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { content } = req.body;

    // Check if marketing plan exists and belongs to user
    const existingPlan = await prisma.marketingPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Marketing plan not found'
      });
    }

    if (existingPlan.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to marketing plan'
      });
    }

    const updatedPlan = await prisma.marketingPlan.update({
      where: { id },
      data: { content }
    });

    res.status(200).json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error updating marketing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete a marketing plan
const deleteMarketingPlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if marketing plan exists and belongs to user
    const existingPlan = await prisma.marketingPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Marketing plan not found'
      });
    }

    if (existingPlan.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to marketing plan'
      });
    }

    await prisma.marketingPlan.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Marketing plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting marketing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMarketingPlans,
  createMarketingPlan,
  getMarketingPlan,
  updateMarketingPlan,
  deleteMarketingPlan
};