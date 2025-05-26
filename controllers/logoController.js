const prisma = require('../config/db');
const { uploadToCloudinary } = require('../config/cloudinary');

// Generate logo using OpenAI API
const generateLogo = async (req, res) => {
  try {
    const { prompt, businessId, style = "modern", size = "1024x1024" } = req.body;
    const userId = req.user.id;

    console.log('Logo generation request:', { prompt, businessId, style, size, userId });

    // Validate required fields
    if (!prompt || !businessId) {
      return res.status(400).json({
        success: false,
        message: 'Prompt and businessId are required'
      });
    }

    // Verify business belongs to user
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

    // Enhanced prompt for logo generation
    const enhancedPrompt = `Create a professional ${style} logo for ${business.name}, a ${business.field} business. ${prompt}. The logo should be clean, scalable, and suitable for business use. No text or words in the image.`;

    console.log('Enhanced prompt:', enhancedPrompt);

    // Call OpenAI API for image generation
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: "standard",
        response_format: "url"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({
        success: false,
        message: 'Failed to generate logo',
        error: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    console.log('OpenAI image generated:', imageUrl);

    // Convert URL to base64 for Cloudinary upload
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`;

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(base64Image);
    console.log('Uploaded to Cloudinary:', cloudinaryUrl);

    // Save to database
    const logoRecord = await prisma.mediaFile.create({
      data: {
        url: cloudinaryUrl,
        type: 'logo',
        userId: userId,
        businessId: parseInt(businessId)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Logo generated successfully',
      data: {
        id: logoRecord.id,
        url: cloudinaryUrl,
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        style: style,
        size: size,
        business: {
          id: business.id,
          name: business.name,
          field: business.field
        }
      }
    });

  } catch (error) {
    console.error('Error generating logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate logo',
      error: error.message
    });
  }
};

// Get logos for a business
const getBusinessLogos = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    // Verify business belongs to user
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

    const logos = await prisma.mediaFile.findMany({
      where: {
        businessId: parseInt(businessId),
        type: 'logo',
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: logos
    });

  } catch (error) {
    console.error('Error fetching logos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logos',
      error: error.message
    });
  }
};

// Get all user logos
const getUserLogos = async (req, res) => {
  try {
    const userId = req.user.id;

    const logos = await prisma.mediaFile.findMany({
      where: {
        userId: userId,
        type: 'logo'
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            field: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: logos
    });

  } catch (error) {
    console.error('Error fetching user logos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logos',
      error: error.message
    });
  }
};

// Delete a logo
const deleteLogo = async (req, res) => {
  try {
    const { logoId } = req.params;
    const userId = req.user.id;

    // Find and verify ownership
    const logo = await prisma.mediaFile.findFirst({
      where: {
        id: parseInt(logoId),
        userId: userId,
        type: 'logo'
      }
    });

    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found or access denied'
      });
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: {
        id: parseInt(logoId)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Logo deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete logo',
      error: error.message
    });
  }
};

// Regenerate logo with variations
const regenerateLogo = async (req, res) => {
  try {
    const { logoId } = req.params;
    const { variations = 1, style } = req.body;
    const userId = req.user.id;

    // Find original logo
    const originalLogo = await prisma.mediaFile.findFirst({
      where: {
        id: parseInt(logoId),
        userId: userId,
        type: 'logo'
      },
      include: {
        business: true
      }
    });

    if (!originalLogo) {
      return res.status(404).json({
        success: false,
        message: 'Original logo not found'
      });
    }

    // Create variation prompt
    const variationPrompt = `Create a ${style || 'modern'} logo variation for ${originalLogo.business.name}, a ${originalLogo.business.field} business. Make it different but maintain the same professional quality. No text or words in the image.`;

    // Generate new logo
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: variationPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        success: false,
        message: 'Failed to generate logo variation',
        error: errorData.error?.message
      });
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    // Convert and upload to Cloudinary
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`;
    const cloudinaryUrl = await uploadToCloudinary(base64Image);

    // Save variation to database
    const logoVariation = await prisma.mediaFile.create({
      data: {
        url: cloudinaryUrl,
        type: 'logo',
        userId: userId,
        businessId: originalLogo.businessId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Logo variation generated successfully',
      data: {
        id: logoVariation.id,
        url: cloudinaryUrl,
        originalLogoId: parseInt(logoId),
        style: style || 'modern'
      }
    });

  } catch (error) {
    console.error('Error regenerating logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate logo',
      error: error.message
    });
  }
};

module.exports = {
  generateLogo,
  getBusinessLogos,
  getUserLogos,
  deleteLogo,
  regenerateLogo
}; 