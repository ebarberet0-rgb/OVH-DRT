import { PrismaClient, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function addBookings() {
  console.log('📝 Ajout de réservations pour la démonstration...\n');

  try {
    // Récupérer les données existantes
    const events = await prisma.event.findMany({
      include: {
        sessions: true,
      },
    });

    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
      },
    });

    const motorcycles = await prisma.motorcycle.findMany();

    if (events.length === 0 || clients.length === 0 || motorcycles.length === 0) {
      console.log('❌ Pas assez de données. Exécutez d\'abord le seed principal.');
      return;
    }

    console.log(`Données trouvées:`);
    console.log(`  - ${events.length} événements`);
    console.log(`  - ${clients.length} clients`);
    console.log(`  - ${motorcycles.length} motos\n`);

    // Compter le nombre total de sessions
    const totalSessions = events.reduce((sum, event) => sum + event.sessions.length, 0);
    console.log(`  - ${totalSessions} sessions disponibles\n`);

    let bookingCount = 0;

    // Créer des réservations pour chaque événement
    for (const event of events) {
      console.log(`Création de réservations pour: ${event.name}`);

      const sessions = event.sessions;

      // Créer 5-10 réservations par événement
      const bookingsToCreate = Math.min(sessions.length * 2, 15);

      for (let i = 0; i < bookingsToCreate; i++) {
        // Sélectionner un client et une session aléatoire
        const client = clients[Math.floor(Math.random() * clients.length)];
        const session = sessions[Math.floor(Math.random() * sessions.length)];

        // Sélectionner une moto aléatoire
        const motorcycle = motorcycles[Math.floor(Math.random() * motorcycles.length)];

        // Statuts variés
        const statuses = [
          BookingStatus.CONFIRMED,
          BookingStatus.CONFIRMED,
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
          BookingStatus.PENDING,
        ];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        try {
          // Vérifier si une réservation existe déjà
          const existing = await prisma.booking.findFirst({
            where: {
              userId: client.id,
              sessionId: session.id,
            },
          });

          if (!existing && session.bookedSlots < session.availableSlots) {
            await prisma.booking.create({
              data: {
                userId: client.id,
                sessionId: session.id,
                motorcycleId: motorcycle.id,
                status: status,
                notes:
                  status === BookingStatus.COMPLETED
                    ? 'Excellent essai ! Client très satisfait de la moto.'
                    : status === BookingStatus.PENDING
                    ? 'En attente de confirmation'
                    : 'Réservation confirmée',
              },
            });

            // Mettre à jour les slots
            await prisma.session.update({
              where: { id: session.id },
              data: {
                bookedSlots: { increment: 1 },
              },
            });

            bookingCount++;
            console.log(`  ✓ Réservation ${bookingCount} créée`);
          }
        } catch (error) {
          // Ignorer les erreurs
          continue;
        }
      }
    }

    console.log(`\n✅ ${bookingCount} réservations créées avec succès !\n`);

    // Afficher un résumé
    const allBookings = await prisma.booking.findMany({
      include: {
        user: true,
        session: {
          include: {
            event: true,
          },
        },
        motorcycle: true,
      },
    });

    console.log('📊 RÉSUMÉ DES RÉSERVATIONS:');
    console.log(`   Total: ${allBookings.length}`);
    console.log(
      `   Confirmées: ${allBookings.filter((b) => b.status === BookingStatus.CONFIRMED).length}`
    );
    console.log(
      `   Complétées: ${allBookings.filter((b) => b.status === BookingStatus.COMPLETED).length}`
    );
    console.log(
      `   En attente: ${allBookings.filter((b) => b.status === BookingStatus.PENDING).length}`
    );

    console.log('\n🎯 Données prêtes pour la démonstration !');
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addBookings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
