# Logo Generation API Documentation

## Overview
The Logo Generation API allows users to create professional logos using OpenAI's DALL-E 3 model. Generated logos are automatically uploaded to Cloudinary and stored in the database.

## Environment Variables Required
```env
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Endpoints

### 1. Generate Logo
**POST** `/api/v1/logos/generate`

Generate a new logo for a business.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "A minimalist tech company logo with blue and white colors",
  "businessId": 1,
  "style": "modern",
  "size": "1024x1024"
}
```

**Parameters:**
- `prompt` (required): Description of the desired logo
- `businessId` (required): ID of the business the logo is for
- `style` (optional): Logo style (default: "modern")
- `size` (optional): Image size (default: "1024x1024")

**Response:**
```json
{
  "success": true,
  "message": "Logo generated successfully",
  "data": {
    "id": 123,
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ai-branding/logo.png",
    "originalPrompt": "A minimalist tech company logo with blue and white colors",
    "enhancedPrompt": "Create a professional modern logo for TechCorp, a technology business...",
    "style": "modern",
    "size": "1024x1024",
    "business": {
      "id": 1,
      "name": "TechCorp",
      "field": "technology"
    }
  }
}
```

### 2. Get User's Logos
**GET** `/api/v1/logos/user`

Get all logos created by the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ai-branding/logo.png",
      "type": "logo",
      "userId": 1,
      "businessId": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "business": {
        "id": 1,
        "name": "TechCorp",
        "field": "technology"
      }
    }
  ]
}
```

### 3. Get Business Logos
**GET** `/api/v1/logos/business/:businessId`

Get all logos for a specific business.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `businessId`: ID of the business

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ai-branding/logo.png",
      "type": "logo",
      "userId": 1,
      "businessId": 1,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 4. Delete Logo
**DELETE** `/api/v1/logos/:logoId`

Delete a specific logo.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `logoId`: ID of the logo to delete

**Response:**
```json
{
  "success": true,
  "message": "Logo deleted successfully"
}
```

### 5. Regenerate Logo
**POST** `/api/v1/logos/:logoId/regenerate`

Create a variation of an existing logo.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**
- `logoId`: ID of the original logo

**Request Body:**
```json
{
  "style": "minimalist",
  "variations": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logo variation generated successfully",
  "data": {
    "id": 124,
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567891/ai-branding/logo-variation.png",
    "originalLogoId": 123,
    "style": "minimalist"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Prompt and businessId are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Business not found or access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Logo not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to generate logo",
  "error": "OpenAI API error details"
}
```

## Frontend Integration Examples

### React/Next.js Example
```javascript
// Generate Logo
const generateLogo = async (prompt, businessId, style = 'modern') => {
  try {
    const response = await fetch('/api/v1/logos/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt,
        businessId,
        style
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Logo generated:', data.data.url);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error generating logo:', error);
    throw error;
  }
};

// Get User Logos
const getUserLogos = async () => {
  try {
    const response = await fetch('/api/v1/logos/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching logos:', error);
    return [];
  }
};
```

## Notes
- All generated logos are automatically uploaded to Cloudinary for reliable storage
- The API enhances user prompts with business context for better results
- Generated logos are saved to the database with proper user and business associations
- All endpoints require authentication via JWT token
- Logo generation may take 10-30 seconds depending on OpenAI API response time 