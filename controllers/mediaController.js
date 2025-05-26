// controllers/mediaController.js
const prisma = require('../config/db');
const { uploadToCloudinary } = require('../config/cloudinary');

// Get media files for a business
const getMediaFiles = async (req, res) => {
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

    const mediaFiles = await prisma.mediaFile.findMany({
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
      data: mediaFiles
    });
  } catch (error) {
    console.error('Error fetching media files:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create a media file
const createMediaFile = async (req, res) => {
  try {
    const { url, type, businessId } = req.body;

    if (!url || !type || !businessId) {
      return res.status(400).json({
        status: 'Error', // Changed for consistency
        message: 'URL, type, and businessId are required'
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
        status: 'Error', // Changed for consistency
        message: 'Unauthorized access to business'
      });
    }

    // Handle data URLs by uploading to Cloudinary
    let finalUrl = url;
    if (url.startsWith('data:')) {
      try {
        finalUrl = await uploadToCloudinary(url);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          status: 'Error',
          message: 'Failed to upload media to cloud storage'
        });
      }
    }

    const mediaFile = await prisma.mediaFile.create({
      data: {
        url: finalUrl,
        type,
        userId: req.user.id,
        businessId: parseInt(businessId)
      }
    });

    res.status(201).json({
      status: 'OK', // Changed for consistency
      data: mediaFile
    });
  } catch (error) {
    console.error('Error creating media file:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Server error'
    });
  }
};

// Upload media
const uploadMedia = async (req, res) => {
  try {
    const { dataUrl, type } = req.body;
    const userId = req.user.id;

    if (!dataUrl) {
      return res.status(400).json({
        status: 'Error',
        message: 'Media data is required'
      });
    }

    // Upload to Cloudinary
    const mediaUrl = await uploadToCloudinary(dataUrl);

    // Save to database
    const mediaFile = await prisma.mediaFile.create({
      data: {
        url: mediaUrl,
        type: type || 'image', // Default to image if type not specified
        userId
      }
    });

    res.status(201).json({
      status: 'OK',
      data: mediaFile
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Failed to upload media'
    });
  }
};

// Get user's media files
const getUserMedia = async (req, res) => {
  try {
    const userId = req.user.id;

    const mediaFiles = await prisma.mediaFile.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      status: 'OK',
      data: mediaFiles
    });
  } catch (error) {
    console.error('Error fetching media files:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Failed to fetch media files'
    });
  }
};

// Delete media file
const deleteMedia = async (req, res) => {
  try {
    const userId = req.user.id;
    const mediaId = parseInt(req.params.id);

    if (isNaN(mediaId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid media ID'
      });
    }

    // Check if media exists and belongs to user
    const mediaFile = await prisma.mediaFile.findUnique({
      where: {
        id: mediaId
      }
    });

    if (!mediaFile) {
      return res.status(404).json({
        status: 'Error',
        message: 'Media file not found'
      });
    }

    if (mediaFile.userId !== userId) {
      return res.status(403).json({
        status: 'Error',
        message: 'Not authorized to delete this media file'
      });
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: {
        id: mediaId
      }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Media file deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media file:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Failed to delete media file'
    });
  }
};

module.exports = {
  getMediaFiles,
  createMediaFile,
  uploadMedia,
  getUserMedia,
  deleteMedia
};