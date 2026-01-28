import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding instructor user...');

  // Créer un mot de passe hashé
  const hashedPassword = await bcrypt.hash('Instructor2026!', 10);

  // Créer un instructeur
  const instructor = await prisma.user.upsert({
    where: { email: 'instructeur@yamaha-drt.fr' },
    update: {},
    create: {
      email: 'instructeur@yamaha-drt.fr',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33612345678',
      role: 'INSTRUCTOR',
      licenseType: 'A',
    },
  });

  console.log('✅ Instructeur créé:', instructor.email);
  console.log('   Email: instructeur@yamaha-drt.fr');
  console.log('   Mot de passe: Instructor2026!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
