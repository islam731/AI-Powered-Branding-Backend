// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { protect } = require('../middleware/authMiddleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Public endpoint - doesn't require authentication
router.post('/', async (req, res) => {
  try {
    const { messages, businessId } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid request: messages must be an array'
      });
    }

    console.log('Processing chat request with messages:', messages);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.origin || 'http://localhost:3001',
        'X-Title': 'BrandFlow AI Assistant'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenRouter API error:', data);
      return res.status(response.status).json({
        status: 'Error',
        message: data.error?.message || 'Failed to get AI response'
      });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    return res.status(500).json({
      status: 'Error',
      message: error.message || 'Internal server error'
    });
  }
});

// Authenticated endpoint - saves conversation to database
router.post('/save', protect, async (req, res) => {
  try {
    const { promptContent, responseContent, businessId } = req.body;
    
    if (!promptContent || !responseContent || !businessId) {
      return res.status(400).json({
        status: 'Error',
        message: 'Missing required fields: promptContent, responseContent, and businessId'
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
        status: 'Error',
        message: 'Unauthorized access to business'
      });
    }

    // Save conversation to database
    const savedConversation = await prisma.conversation.create({
      data: {
        promptContent,
        responseContent,
        userId: req.user.id,
        businessId: parseInt(businessId)
      }
    });
    
    return res.status(201).json({
      status: 'Success',
      data: savedConversation
    });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return res.status(500).json({
      status: 'Error',
      message: error.message || 'Internal server error'
    });
  }
});

// Get conversation history for a business
router.get('/history', protect, async (req, res) => {
  try {
    const { businessId } = req.query;
    
    if (!businessId) {
      return res.status(400).json({
        status: 'Error',
        message: 'Missing businessId query parameter'
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
        status: 'Error',
        message: 'Unauthorized access to business'
      });
    }

    // Get conversations for the business
    const conversations = await prisma.conversation.findMany({
      where: {
        businessId: parseInt(businessId),
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.json({
      status: 'Success',
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return res.status(500).json({
      status: 'Error',
      message: error.message || 'Internal server error'
    });
  }
});

module.exports = router;