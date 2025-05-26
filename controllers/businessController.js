const prisma = require('../config/db');

// Get all businesses for a user
const getBusinesses = async (req, res) => {
  try {
    const userId = req.user.id;

    const businesses = await prisma.business.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      status: 'OK',
      data: businesses
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Failed to fetch businesses'
    });
  }
};

// Create a new business
const createBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, field, description, colorPalette } = req.body;

    if (!name || !field) {
      return res.status(400).json({
        status: 'Error',
        message: 'Business name and field are required'
      });
    }

    const business = await prisma.business.create({
      data: {
        name,
        field,
        description,
        colorPalette,
        userId
      }
    });

    res.status(201).json({
      status: 'OK',
      data: business
    });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Failed to create business'
    });
  }
};

// Get a single business
const getBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const businessId = parseInt(req.params.id);

    if (isNaN(businessId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid business ID'
      });
    }

    const business = await prisma.business.findUnique({
      where: {
        id: businessId
      }
    });

    if (!business) {
      return res.status(404).json({
        status: 'Error',
        message: 'Business not found'
      });
    }

    if (business.userId !== userId) {
      return res.status(403).json({
        status: 'Error',
        message: 'Not authorized to access this business'
      });
    }

    res.status(200).json({
      status: 'OK',
      data: business
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Failed to fetch business'
    });
  }
};

// Update a business
const updateBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const businessId = parseInt(req.params.id);
    const { name, field, description, colorPalette } = req.body;

    if (isNaN(businessId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid business ID'
      });
    }

    // Check if business exists and belongs to user
    const existingBusiness = await prisma.business.findUnique({
      where: {
        id: businessId
      }
    });

    if (!existingBusiness) {
      return res.status(404).json({
        status: 'Error',
        message: 'Business not found'
      });
    }

    if (existingBusiness.userId !== userId) {
      return res.status(403).json({
        status: 'Error',
        message: 'Not authorized to update this business'
      });
    }

    const business = await prisma.business.update({
      where: {
        id: businessId
      },
      data: {
        name: name || existingBusiness.name,
        field: field || existingBusiness.field,
        description: description !== undefined ? description : existingBusiness.description,
        colorPalette: colorPalette !== undefined ? colorPalette : existingBusiness.colorPalette
      }
    });

    res.status(200).json({
      status: 'OK',
      data: business
    });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Failed to update business'
    });
  }
};

// Delete a business
const deleteBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const businessId = parseInt(req.params.id);

    if (isNaN(businessId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid business ID'
      });
    }

    // Check if business exists and belongs to user
    const existingBusiness = await prisma.business.findUnique({
      where: {
        id: businessId
      }
    });

    if (!existingBusiness) {
      return res.status(404).json({
        status: 'Error',
        message: 'Business not found'
      });
    }

    if (existingBusiness.userId !== userId) {
      return res.status(403).json({
        status: 'Error',
        message: 'Not authorized to delete this business'
      });
    }

    await prisma.business.delete({
      where: {
        id: businessId
      }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Failed to delete business'
    });
  }
};

module.exports = {
  getBusinesses,
  createBusiness,
  getBusiness,
  updateBusiness,
  deleteBusiness
};