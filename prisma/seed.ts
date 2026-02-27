import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create sample startup user
  const startupPassword = await bcrypt.hash('startup123', 12);
  const startupUser = await prisma.user.upsert({
    where: { email: 'startup@example.com' },
    update: {},
    create: {
      email: 'startup@example.com',
      name: 'Startup Founder',
      password: startupPassword,
      role: 'STARTUP',
      startup: {
        create: {
          companyName: 'Sample Startup',
          website: 'https://samplestartup.com',
          hq: 'San Francisco, USA',
          incorporationCountry: 'USA',
          stage: 'seed',
          sector: 'saas',
          b2bB2c: 'B2B',
          tractionHighlights: '$50k MRR, 20% MoM growth',
          founders: 'John Doe, Jane Smith',
          teamRoles: 'CEO, CTO',
          problem: 'Small businesses struggle to manage their finances efficiently',
          solution: 'All-in-one financial management platform',
          differentiation: 'AI-powered insights and automation',
          moat: 'Proprietary ML models and strong customer relationships',
          revenue: '$50,000',
          growth: '20% MoM',
          users: '500',
          retention: '95%',
          roundType: 'Seed',
          targetAmount: '$1,500,000',
          valuation: '$8,000,000',
          useOfFunds: 'Engineering, Sales, Marketing',
          status: 'SHORTLISTED',
          score: 85,
          teamScore: 90,
          marketScore: 80,
          tractionScore: 85,
          productScore: 85,
        },
      },
    },
  });
  console.log('Created startup user:', startupUser.email);

  // Get the startup ID
  const startup = await prisma.startup.findUnique({
    where: { ownerUserId: startupUser.id },
  });

  // Create sample investor user
  const investorPassword = await bcrypt.hash('investor123', 12);
  const investorUser = await prisma.user.upsert({
    where: { email: 'investor@example.com' },
    update: {},
    create: {
      email: 'investor@example.com',
      name: 'Sample Investor',
      password: investorPassword,
      role: 'INVESTOR',
    },
  });
  console.log('Created investor user:', investorUser.email);

  // Create a deal room
  if (startup) {
    const dealRoom = await prisma.dealRoom.upsert({
      where: { id: 'sample-deal-room' },
      update: {},
      create: {
        id: 'sample-deal-room',
        name: 'Seed Fund Portfolio',
        description: 'Curated seed-stage SaaS companies',
        createdByAdminId: admin.id,
        startups: {
          create: {
            startupId: startup.id,
          },
        },
        investors: {
          create: {
            investorUserId: investorUser.id,
          },
        },
        visibilityConfigs: {
          create: {
            visibleFields: JSON.stringify([
              'companyName',
              'website',
              'hq',
              'stage',
              'sector',
              'tractionHighlights',
              'problem',
              'solution',
              'differentiation',
              'founders',
              'roundType',
              'targetAmount',
            ]),
          },
        },
      },
    });
    console.log('Created deal room:', dealRoom.name);
  }

  console.log('\nSeeding completed!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@example.com / admin123');
  console.log('  Startup: startup@example.com / startup123');
  console.log('  Investor: investor@example.com / investor123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
