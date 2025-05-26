// cloudinary.js - UPDATED VERSION
const cloudinary = require('cloudinary').v2;

console.log('Cloudinary Environment Variables:');
console.log(`CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Set ✓' : 'MISSING ✗'}`);
console.log(`API_KEY: ${process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'MISSING ✗'}`);
console.log(`API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'MISSING ✗'}`);

try {
  // Get individual credentials from environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  // Set the CLOUDINARY_URL environment variable
  if (cloudName && apiKey && apiSecret) {
    process.env.CLOUDINARY_URL = `cloudinary://${apiKey}:${apiSecret}@${cloudName}`;
    
    // IMPORTANT: Explicitly configure cloudinary with the credentials
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    
    console.log('Cloudinary configured successfully');
    
    // Verify configuration with a simple test
    const signResult = cloudinary.utils.api_sign_request(
      { timestamp: Math.round(new Date().getTime() / 1000) },
      apiSecret
    );
    console.log('Signature test successful');
  } else {
    throw new Error('Missing one or more Cloudinary credentials');
  }
} catch (error) {
  console.error('Error configuring Cloudinary:', error.message);
}

// Upload function with improved error handling
const uploadToCloudinary = async (dataUrl) => {
  try {
    // Verify we have credentials before attempting upload
    if (!cloudinary.config().api_key) {
      throw new Error('Cloudinary not properly configured');
    }
    
    console.log('Starting Cloudinary upload...');
    const result = await cloudinary.uploader.upload(dataUrl, {
      resource_type: "auto",
      folder: "ai-branding" 
    });
    console.log('Cloudinary upload successful');
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload media to Cloudinary: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};