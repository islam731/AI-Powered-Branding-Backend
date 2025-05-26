const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Database connection successful!');
    console.log('Test query result:', result);
    
    // Try to count users
    const userCount = await prisma.user.count();
    console.log(`Current user count in database: ${userCount}`);
    
    return true;
  } catch (error) {
    console.error('Database connection failed:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();