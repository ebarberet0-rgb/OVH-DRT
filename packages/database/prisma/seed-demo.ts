import { PrismaClient, UserRole, EventType, MotorcycleGroup, LicenseType, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedDemo() {
  console.log('🎬 Création des données de démonstration...\n');

  try {
    // ============================================
    // 1. CRÉER DES ÉVÉNEMENTS RÉALISTES
    // ============================================
    console.log('📅 Création des événements...');

    const dealers = await prisma.dealer.findMany();

    if (dealers.length === 0) {
      console.log('❌ Aucun concessionnaire trouvé. Exécutez d\'abord le seed principal.');
      return;
    }

    const events = [];

    // Événement 1 : Demo Ride Tour Paris - Ce week-end
    const event1 = await prisma.event.create({
      data: {
        name: 'Demo Ride Tour - Paris La Défense',
        type: EventType.DEALERSHIP,
        dealerId: dealers[0].id,
        startDate: new Date('2026-01-18T09:00:00'), // Samedi prochain
        endDate: new Date('2026-01-19T18:00:00'),   // Dimanche
        address: '25 Boulevard de la Défense',
        city: 'Paris',
        postalCode: '92400',
        latitude: 48.8897,
        longitude: 2.2410,
        maxSlotsPerSession: 8,
        description: 'Venez essayer toute la gamme Yamaha 2026 ! Roadsters, sportives, trails et scooters.',
      },
    });
    events.push(event1);
    console.log('  ✓ Demo Ride Tour - Paris La Défense (18-19 janvier)');

    // Événement 2 : Salon de la Moto Lyon
    const event2 = await prisma.event.create({
      data: {
        name: 'Salon de la Moto - Lyon Eurexpo',
        type: EventType.SHOW,
        dealerId: dealers[1]?.id || dealers[0].id,
        startDate: new Date('2026-02-01T10:00:00'),
        endDate: new Date('2026-02-04T19:00:00'),
        address: 'Boulevard de l\'Europe',
        city: 'Chassieu',
        postalCode: '69680',
        latitude: 45.7322,
        longitude: 5.0053,
        maxSlotsPerSession: 10,
        description: 'Stand Yamaha au salon de la moto de Lyon. Essais sur circuit fermé.',
      },
    });
    events.push(event2);
    console.log('  ✓ Salon de la Moto - Lyon Eurexpo (1-4 février)');

    // Événement 3 : Journée portes ouvertes
    const event3 = await prisma.event.create({
      data: {
        name: 'Journée Portes Ouvertes - Yamaha Bordeaux',
        type: EventType.DEALERSHIP,
        dealerId: dealers[0].id,
        startDate: new Date('2026-02-15T09:00:00'),
        endDate: new Date('2026-02-15T18:00:00'),
        address: '156 Avenue de la Libération',
        city: 'Bordeaux',
        postalCode: '33000',
        latitude: 44.8378,
        longitude: -0.5792,
        maxSlotsPerSession: 6,
        description: 'Découverte exclusive de la nouvelle gamme MT. Tarifs spéciaux ce jour.',
      },
    });
    events.push(event3);
    console.log('  ✓ Journée Portes Ouvertes - Bordeaux (15 février)\n');

    // ============================================
    // 2. CRÉER DES SESSIONS POUR CHAQUE ÉVÉNEMENT
    // ============================================
    console.log('⏰ Création des sessions...');

    const instructors = await prisma.user.findMany({
      where: { role: UserRole.INSTRUCTOR },
    });

    const motorcycles = await prisma.motorcycle.findMany();
    const motorcyclesGroup1 = motorcycles.filter(m => m.group === MotorcycleGroup.GROUP_1);
    const motorcyclesGroup2 = motorcycles.filter(m => m.group === MotorcycleGroup.GROUP_2);

    // Sessions pour l'événement 1 (2 jours)
    const sessions1 = [];
    const timeSlotsDay1 = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];

    for (let day = 0; day < 2; day++) {
      const date = new Date('2026-01-18');
      date.setDate(date.getDate() + day);

      for (const time of timeSlotsDay1) {
        const session1 = await prisma.session.create({
          data: {
            eventId: event1.id,
            group: MotorcycleGroup.GROUP_1,
            startTime: new Date(`${date.toISOString().split('T')[0]}T${time}:00`),
            endTime: new Date(new Date(`${date.toISOString().split('T')[0]}T${time}:00`).getTime() + 60 * 60000),
            availableSlots: 8,
            bookedSlots: 0,
            instructorId: instructors[0]?.id,
          },
        });
        sessions1.push(session1);

        const session2 = await prisma.session.create({
          data: {
            eventId: event1.id,
            group: MotorcycleGroup.GROUP_2,
            startTime: new Date(new Date(`${date.toISOString().split('T')[0]}T${time}:00`).getTime() + 30 * 60000),
            endTime: new Date(new Date(`${date.toISOString().split('T')[0]}T${time}:00`).getTime() + 90 * 60000),
            availableSlots: 8,
            bookedSlots: 0,
            instructorId: instructors[1]?.id || instructors[0]?.id,
          },
        });
        sessions1.push(session2);
      }
    }
    console.log(`  ✓ ${sessions1.length} sessions créées pour Paris`);

    // Sessions pour l'événement 2 (Lyon - 4 jours)
    const sessions2 = [];
    for (let day = 0; day < 4; day++) {
      const date = new Date('2026-02-01');
      date.setDate(date.getDate() + day);

      const timeSlotsDay = ['10:00', '11:30', '14:00', '15:30', '17:00'];

      for (const time of timeSlotsDay) {
        const session = await prisma.session.create({
          data: {
            eventId: event2.id,
            group: MotorcycleGroup.GROUP_1,
            startTime: new Date(`${date.toISOString().split('T')[0]}T${time}:00`),
            endTime: new Date(new Date(`${date.toISOString().split('T')[0]}T${time}:00`).getTime() + 50 * 60000),
            availableSlots: 10,
            bookedSlots: 0,
            instructorId: instructors[0]?.id,
          },
        });
        sessions2.push(session);
      }
    }
    console.log(`  ✓ ${sessions2.length} sessions créées pour Lyon`);

    // Sessions pour l'événement 3 (Bordeaux - 1 jour)
    const sessions3 = [];
    const timeSlotsDay3 = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

    for (const time of timeSlotsDay3) {
      const session = await prisma.session.create({
        data: {
          eventId: event3.id,
          group: MotorcycleGroup.GROUP_1,
          startTime: new Date(`2026-02-15T${time}:00`),
          endTime: new Date(new Date(`2026-02-15T${time}:00`).getTime() + 45 * 60000),
          availableSlots: 6,
          bookedSlots: 0,
          instructorId: instructors[0]?.id,
        },
      });
      sessions3.push(session);
    }
    console.log(`  ✓ ${sessions3.length} sessions créées pour Bordeaux\n`);

    // ============================================
    // 3. CRÉER DES CLIENTS RÉALISTES
    // ============================================
    console.log('👥 Création des clients...');

    const clients = [];

    const clientsData = [
      { firstName: 'Thomas', lastName: 'Dubois', email: 'thomas.dubois@gmail.com', phone: '+33612345678', city: 'Paris', postalCode: '75001', license: LicenseType.A, brand: 'Honda', model: 'CB650R' },
      { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@outlook.fr', phone: '+33623456789', city: 'Lyon', postalCode: '69001', license: LicenseType.A2, brand: 'Kawasaki', model: 'Z650' },
      { firstName: 'Lucas', lastName: 'Bernard', email: 'lucas.bernard@free.fr', phone: '+33634567890', city: 'Marseille', postalCode: '13001', license: LicenseType.A, brand: 'Suzuki', model: 'GSX-S750' },
      { firstName: 'Emma', lastName: 'Petit', email: 'emma.petit@gmail.com', phone: '+33645678901', city: 'Toulouse', postalCode: '31000', license: LicenseType.A2, brand: null, model: null },
      { firstName: 'Alexandre', lastName: 'Durand', email: 'alex.durand@yahoo.fr', phone: '+33656789012', city: 'Nice', postalCode: '06000', license: LicenseType.A, brand: 'Yamaha', model: 'MT-07' },
      { firstName: 'Léa', lastName: 'Leroy', email: 'lea.leroy@gmail.com', phone: '+33667890123', city: 'Nantes', postalCode: '44000', license: LicenseType.A1, brand: null, model: null },
      { firstName: 'Maxime', lastName: 'Moreau', email: 'maxime.moreau@hotmail.com', phone: '+33678901234', city: 'Strasbourg', postalCode: '67000', license: LicenseType.A, brand: 'BMW', model: 'F900R' },
      { firstName: 'Chloé', lastName: 'Simon', email: 'chloe.simon@gmail.com', phone: '+33689012345', city: 'Bordeaux', postalCode: '33000', license: LicenseType.A2, brand: 'KTM', model: 'Duke 390' },
      { firstName: 'Hugo', lastName: 'Laurent', email: 'hugo.laurent@orange.fr', phone: '+33690123456', city: 'Lille', postalCode: '59000', license: LicenseType.A, brand: 'Triumph', model: 'Street Triple' },
      { firstName: 'Camille', lastName: 'Lefebvre', email: 'camille.lefebvre@gmail.com', phone: '+33601234567', city: 'Rennes', postalCode: '35000', license: LicenseType.A, brand: null, model: null },
      { firstName: 'Antoine', lastName: 'Roux', email: 'antoine.roux@laposte.net', phone: '+33612345670', city: 'Montpellier', postalCode: '34000', license: LicenseType.A2, brand: 'Yamaha', model: 'XSR700' },
      { firstName: 'Julie', lastName: 'Fournier', email: 'julie.fournier@gmail.com', phone: '+33623456701', city: 'Reims', postalCode: '51100', license: LicenseType.A, brand: 'Ducati', model: 'Monster' },
      { firstName: 'Nicolas', lastName: 'Girard', email: 'nicolas.girard@sfr.fr', phone: '+33634567012', city: 'Le Havre', postalCode: '76600', license: LicenseType.A, brand: 'Honda', model: 'CB500X' },
      { firstName: 'Sarah', lastName: 'Bonnet', email: 'sarah.bonnet@gmail.com', phone: '+33645670123', city: 'Dijon', postalCode: '21000', license: LicenseType.A2, brand: null, model: null },
      { firstName: 'Julien', lastName: 'Dupont', email: 'julien.dupont@bbox.fr', phone: '+33656701234', city: 'Angers', postalCode: '49000', license: LicenseType.A, brand: 'Yamaha', model: 'Tracer 700' },
    ];

    for (const clientData of clientsData) {
      const client = await prisma.user.create({
        data: {
          ...clientData,
          password: await bcrypt.hash('demo123', 10),
          role: UserRole.CLIENT,
          currentBrand: clientData.brand,
          currentModel: clientData.model,
          licenseType: clientData.license,
        },
      });
      clients.push(client);
    }
    console.log(`  ✓ ${clients.length} clients créés\n`);

    // ============================================
    // 4. CRÉER DES RÉSERVATIONS
    // ============================================
    console.log('📝 Création des réservations...');

    const allSessions = [...sessions1, ...sessions2, ...sessions3];
    let bookingCount = 0;

    // Créer 30-40 réservations réparties sur les événements
    for (let i = 0; i < 35; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const session = allSessions[Math.floor(Math.random() * allSessions.length)];

      // Sélectionner une moto compatible avec le permis du client
      let availableMotos = motorcycles;
      if (client.licenseType === LicenseType.A1) {
        availableMotos = motorcycles.filter(m => m.requiredLicense === LicenseType.A1);
      } else if (client.licenseType === LicenseType.A2) {
        availableMotos = motorcycles.filter(m =>
          m.requiredLicense === LicenseType.A1 || m.requiredLicense === LicenseType.A2
        );
      }

      if (availableMotos.length === 0) continue;

      const motorcycle = availableMotos[Math.floor(Math.random() * availableMotos.length)];

      // Statuts variés pour rendre la démo réaliste
      const statuses = [
        BookingStatus.CONFIRMED,
        BookingStatus.CONFIRMED,
        BookingStatus.CONFIRMED,
        BookingStatus.COMPLETED,
        BookingStatus.PENDING,
      ];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      try {
        // Vérifier si le client n'a pas déjà une réservation pour cette session
        const existingBooking = await prisma.booking.findFirst({
          where: {
            userId: client.id,
            sessionId: session.id,
          },
        });

        if (!existingBooking) {
          await prisma.booking.create({
            data: {
              userId: client.id,
              sessionId: session.id,
              motorcycleId: motorcycle.id,
              status: status,
              notes: status === BookingStatus.COMPLETED
                ? 'Excellent test ! Le client était très satisfait.'
                : status === BookingStatus.PENDING
                ? 'En attente de confirmation du permis'
                : null,
            },
          });

          // Mettre à jour le compteur de slots réservés
          await prisma.session.update({
            where: { id: session.id },
            data: {
              bookedSlots: { increment: 1 },
            },
          });

          bookingCount++;
        }
      } catch (error) {
        // Ignorer les erreurs de doublons
        continue;
      }
    }
    console.log(`  ✓ ${bookingCount} réservations créées\n`);

    // ============================================
    // 5. ASSOCIER LES MOTOS AUX ÉVÉNEMENTS
    // ============================================
    console.log('🔗 Association des motos aux événements...');

    for (const event of events) {
      for (const motorcycle of motorcycles) {
        await prisma.motorcycleAvailability.create({
          data: {
            motorcycleId: motorcycle.id,
            eventId: event.id,
            isAvailable: true,
          },
        });
      }
    }
    console.log(`  ✓ ${motorcycles.length} motos associées à ${events.length} événements\n`);

    // ============================================
    // RÉSUMÉ
    // ============================================
    console.log('✅ Données de démonstration créées avec succès !\n');
    console.log('📊 RÉSUMÉ:');
    console.log(`   - ${events.length} événements créés`);
    console.log(`   - ${allSessions.length} sessions créées`);
    console.log(`   - ${clients.length} clients créés`);
    console.log(`   - ${bookingCount} réservations créées`);
    console.log(`   - ${motorcycles.length} motos disponibles\n`);

    console.log('📋 ÉVÉNEMENTS:');
    console.log('   1. Demo Ride Tour Paris - 18-19 janvier 2026');
    console.log('   2. Salon de la Moto Lyon - 1-4 février 2026');
    console.log('   3. Portes Ouvertes Bordeaux - 15 février 2026\n');

    console.log('🔐 ACCÈS CLIENTS (pour tester):');
    console.log('   Email: thomas.dubois@gmail.com / Mot de passe: demo123');
    console.log('   Email: sophie.martin@outlook.fr / Mot de passe: demo123');
    console.log('   Email: lucas.bernard@free.fr / Mot de passe: demo123');
    console.log('   (Tous les clients ont le mot de passe: demo123)\n');

    console.log('🎯 Prêt pour la démonstration !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDemo()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
