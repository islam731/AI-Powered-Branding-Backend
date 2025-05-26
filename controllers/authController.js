const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: '30d',
  });
};

// Register user
const registerUser = async (req, res) => {
  try {
    console.log('💡 Registration attempt with data:', JSON.stringify(req.body));
    const { name, email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Validation failed: Missing email or password');
      return res.status(400).json({ 
        status: 'Error', 
        message: 'Please provide email and password' 
      });
    }

    // Check if user exists
    console.log('🔍 Checking if user already exists...');
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ 
        status: 'Error', 
        message: 'User already exists' 
      });
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('📝 Creating user in database...');
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    }).catch(error => {
      console.error('❌ Database error creating user:', error);
      throw error; // Re-throw to be caught by the outer catch
    });

    console.log('✅ User created successfully! ID:', user.id);

    res.status(201).json({
      status: 'OK',
      data: {
        token: generateToken(user.id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      status: 'Error', 
      message: 'Server error during registration',
      details: error.message 
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    console.log('💡 Login attempt for:', req.body.email);
    const { email, password } = req.body;

    // Check for user email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      console.log('✅ Login successful for user ID:', user.id);
      res.json({
        status: 'OK',
        data: {
          token: generateToken(user.id),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } else {
      console.log('❌ Invalid login credentials for:', email);
      res.status(400).json({ status: 'Error', message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ status: 'Error', message: 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};