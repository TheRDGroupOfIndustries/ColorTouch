const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database connection...');
    
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    if (users.length > 0) {
      console.log('First user:', users[0]);
    }
    
    const leads = await prisma.lead.findMany();
    console.log('Leads found:', leads.length);
    
    // Try to create a test lead
    if (users.length > 0) {
      console.log('\nTrying to create a test lead...');
      const testLead = await prisma.lead.create({
        data: {
          name: 'Test Lead',
          email: 'test-' + Date.now() + '@example.com',
          phone: '1234567890',
          duration: 30,
          userId: users[0].id,
        }
      });
      console.log('Test lead created:', testLead.id);
      
      // Delete the test lead
      await prisma.lead.delete({ where: { id: testLead.id } });
      console.log('Test lead deleted');
    }
    
    console.log('\n✅ Database connection is working!');
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error('Full error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
