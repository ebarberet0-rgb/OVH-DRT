const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function addClientsAndBookings() {
  console.log('🎬 Création de données de démonstration...\n');

  // 1. Créer plus de clients
  console.log('👥 Création de 10 nouveaux clients...');

  const clientsData = [
    { firstName: 'Thomas', lastName: 'Dubois', email: 'thomas.dubois@gmail.com', phone: '+33612345678', city: 'Paris', postalCode: '75001', license: 'A' },
    { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@outlook.fr', phone: '+33623456789', city: 'Lyon', postalCode: '69001', license: 'A2' },
    { firstName: 'Lucas', lastName: 'Bernard', email: 'lucas.bernard@free.fr', phone: '+33634567890', city: 'Marseille', postalCode: '13001', license: 'A' },
    { firstName: 'Emma', lastName: 'Petit', email: 'emma.petit@gmail.com', phone: '+33645678901', city: 'Toulouse', postalCode: '31000', license: 'A2' },
    { firstName: 'Alexandre', lastName: 'Durand', email: 'alex.durand@yahoo.fr', phone: '+33656789012', city: 'Nice', postalCode: '06000', license: 'A' },
    { firstName: 'Léa', lastName: 'Leroy', email: 'lea.leroy@gmail.com', phone: '+33667890123', city: 'Nantes', postalCode: '44000', license: 'A1' },
    { firstName: 'Maxime', lastName: 'Moreau', email: 'maxime.moreau@hotmail.com', phone: '+33678901234', city: 'Strasbourg', postalCode: '67000', license: 'A' },
    { firstName: 'Chloé', lastName: 'Simon', email: 'chloe.simon@gmail.com', phone: '+33689012345', city: 'Bordeaux', postalCode: '33000', license: 'A2' },
    { firstName: 'Hugo', lastName: 'Laurent', email: 'hugo.laurent@orange.fr', phone: '+33690123456', city: 'Lille', postalCode: '59000', license: 'A' },
    { firstName: 'Camille', lastName: 'Lefebvre', email: 'camille.lefebvre@gmail.com', phone: '+33601234567', city: 'Rennes', postalCode: '35000', license: 'A' },
  ];

  const password = await bcrypt.hash('demo123', 10);
  const newClients = [];

  for (const clientData of clientsData) {
    try {
      const client = await prisma.user.create({
        data: {
          ...clientData,
          password,
          role: 'CLIENT',
          licenseType: clientData.license,
        },
      });
      newClients.push(client);
      console.log(`  ✓ ${clientData.firstName} ${clientData.lastName}`);
    } catch (e) {
      console.log(`  - ${clientData.firstName} ${clientData.lastName} (existe déjà)`);
    }
  }

  console.log(`\n✅ ${newClients.length} nouveaux clients créés\n`);

  // 2. Créer des réservations
  console.log('📝 Création de réservations...');

  const sessions = await prisma.session.findMany();
  const allClients = await prisma.user.findMany({ where: { role: 'CLIENT' } });
  const motos = await prisma.motorcycle.findMany();

  console.log(`  - ${sessions.length} sessions disponibles`);
  console.log(`  - ${allClients.length} clients au total`);
  console.log(`  - ${motos.length} motos\n`);

  let bookingCount = 0;

  // Créer 15-20 réservations
  for (let i = 0; i < 25; i++) {
    const session = sessions[Math.floor(Math.random() * sessions.length)];
    const client = allClients[Math.floor(Math.random() * allClients.length)];
    const moto = motos[Math.floor(Math.random() * motos.length)];

    const statuses = ['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'COMPLETED', 'PENDING'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    try {
      // Vérifier si pas déjà une réservation
      const existing = await prisma.booking.findFirst({
        where: {
          userId: client.id,
          sessionId: session.id,
        },
      });

      if (!existing) {
        await prisma.booking.create({
          data: {
            userId: client.id,
            sessionId: session.id,
            motorcycleId: moto.id,
            status: status,
            notes: status === 'COMPLETED' ? 'Excellent essai !' : null,
          },
        });

        await prisma.session.update({
          where: { id: session.id },
          data: { bookedSlots: { increment: 1 } },
        });

        bookingCount++;
        console.log(`  ✓ Réservation ${bookingCount}`);
      }
    } catch (e) {
      // Ignorer les erreurs
    }
  }

  console.log(`\n✅ ${bookingCount} réservations créées !\n`);

  // 3. Afficher un résumé
  const totalBookings = await prisma.booking.count();
  const totalEvents = await prisma.event.count();
  const totalSessions = await prisma.session.count();

  console.log('📊 RÉSUMÉ FINAL:');
  console.log(`   - ${totalEvents} événements`);
  console.log(`   - ${totalSessions} sessions`);
  console.log(`   - ${allClients.length} clients`);
  console.log(`   - ${totalBookings} réservations`);
  console.log(`   - ${motos.length} motos disponibles\n`);

  console.log('🔐 CONNEXION CLIENTS (mot de passe: demo123):');
  console.log('   - thomas.dubois@gmail.com');
  console.log('   - sophie.martin@outlook.fr');
  console.log('   - lucas.bernard@free.fr\n');

  console.log('🎯 Prêt pour la démonstration !');

  await prisma.$disconnect();
}

addClientsAndBookings().catch(console.error);
