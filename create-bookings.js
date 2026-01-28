const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBookings() {
  console.log('📝 Création de réservations...\n');

  const sessions = await prisma.session.findMany();
  const clients = await prisma.user.findMany({ where: { role: 'CLIENT' } });
  const motos = await prisma.motorcycle.findMany();

  console.log(`Données disponibles:`);
  console.log(`  - ${sessions.length} sessions`);
  console.log(`  - ${clients.length} clients`);
  console.log(`  - ${motos.length} motos\n`);

  let count = 0;

  for (let i = 0; i < 20; i++) {
    const session = sessions[Math.floor(Math.random() * sessions.length)];
    const user = clients[Math.floor(Math.random() * clients.length)];
    const moto = motos[Math.floor(Math.random() * motos.length)];

    const statuses = ['CONFIRMED', 'CONFIRMED', 'COMPLETED', 'PENDING'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    try {
      if (session.bookedSlots < session.availableSlots) {
        await prisma.booking.create({
          data: {
            userId: user.id,
            sessionId: session.id,
            motorcycleId: moto.id,
            status: status,
          },
        });

        await prisma.session.update({
          where: { id: session.id },
          data: { bookedSlots: { increment: 1 } },
        });

        count++;
        console.log(`  ✓ Réservation ${count} créée`);
      }
    } catch (e) {
      // Ignorer les erreurs
    }
  }

  console.log(`\n✅ ${count} réservations créées !`);
  await prisma.$disconnect();
}

createBookings().catch(console.error);
