const { PrismaClient } = require("./app/generated/prisma");

async function testDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Check if DRSeries table exists and has data
    const seriesCount = await prisma.dRSeries.count();
    console.log(`📊 DRSeries records: ${seriesCount}`);

    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("📋 Available tables:", tables);

    if (seriesCount === 0) {
      console.log("💡 No campaigns found. This is normal for a new database.");
    }
  } catch (error) {
    console.error("❌ Database error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
