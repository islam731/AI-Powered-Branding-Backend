const express = require('express');
const router = express.Router();
const { uploadToCloudinary } = require('../config/cloudinary');
const prisma = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Add this new endpoint for handling uploads
router.post('/upload', protect, async (req, res) => {
    try {
      const { dataUrl, type, businessId } = req.body;
      
      // Get the authenticated user ID from the request
      const userId = req.user.id;
      
      console.log('Upload request:', { type, businessId, userId });
      
      if (!dataUrl || !type || !businessId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: dataUrl, type, or businessId' 
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Verify that the business belongs to the user
      const business = await prisma.business.findFirst({
        where: {
          id: parseInt(businessId),
          userId: userId
        }
      });

      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'Business not found or access denied'
        });
      }
  
      // Upload image to Cloudinary
      console.log('Uploading to Cloudinary...');
      const cloudinaryUrl = await uploadToCloudinary(dataUrl);
      console.log('Cloudinary upload successful:', cloudinaryUrl);
      
      // Save the media file entry in database with direct field assignment
      const mediaFile = await prisma.mediaFile.create({
        data: {
          url: cloudinaryUrl,
          type,
          userId: userId,
          businessId: parseInt(businessId)
        }
      });
  
      return res.status(201).json({
        success: true,
        message: 'Media file uploaded successfully',
        data: mediaFile
      });
    } catch (error) {
      console.error('Error uploading media file:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload media file',
        error: error.message
      });
    }
});

module.exports = router;