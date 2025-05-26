const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.json({
      status: 'OK',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'Error', message: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
};