import { PrismaClient, UserRole, EventType, MotorcycleGroup, LicenseType, MotorcycleStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed de la base de données...');

  // Nettoyer la base de données
  await prisma.notification.deleteMany();
  await prisma.websiteAnalytics.deleteMany();
  await prisma.dRTTeamReport.deleteMany();
  await prisma.dealerSatisfactionForm.deleteMany();
  await prisma.clientSatisfactionForm.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.session.deleteMany();
  await prisma.motorcycleAvailability.deleteMany();
  await prisma.motorcycleDamage.deleteMany();
  await prisma.motorcycle.deleteMany();
  await prisma.event.deleteMany();
  await prisma.dealer.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Base de données nettoyée');

  // Créer un utilisateur admin (Héloïse)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'heloise@yamaha.fr',
      password: adminPassword,
      firstName: 'Héloïse',
      lastName: 'Admin',
      phone: '+33612345678',
      role: UserRole.ADMIN,
    },
  });
  console.log('✓ Utilisateur admin créé');

  // Créer des instructeurs
  const instructor1 = await prisma.user.create({
    data: {
      email: 'instructor1@yamaha.fr',
      password: await bcrypt.hash('instructor123', 10),
      firstName: 'Jean',
      lastName: 'Martin',
      phone: '+33623456789',
      role: UserRole.INSTRUCTOR,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: 'instructor2@yamaha.fr',
      password: await bcrypt.hash('instructor123', 10),
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '+33634567890',
      role: UserRole.INSTRUCTOR,
    },
  });
  console.log('✓ Instructeurs créés');

  // Créer des concessionnaires
  const dealer1 = await prisma.dealer.create({
    data: {
      name: 'Yamaha Paris Nord',
      email: 'contact@yamaha-paris-nord.fr',
      phone: '+33145678901',
      address: '123 Avenue de la République',
      city: 'Paris',
      postalCode: '75011',
      region: 'Île-de-France',
      winteamUrl: 'https://yamaha-paris-nord.fr',
    },
  });

  const dealer2 = await prisma.dealer.create({
    data: {
      name: 'Yamaha Lyon Centre',
      email: 'contact@yamaha-lyon.fr',
      phone: '+33478901234',
      address: '45 Rue de la Liberté',
      city: 'Lyon',
      postalCode: '69003',
      region: 'Auvergne-Rhône-Alpes',
      winteamUrl: 'https://yamaha-lyon.fr',
    },
  });
  console.log('✓ Concessionnaires créés');

  // Créer des motos - Groupe 1 (A2)
  const motorcycles1 = await Promise.all([
    prisma.motorcycle.create({
      data: {
        model: 'MT-07',
        plateNumber: 'AA-123-BB',
        bikeNumber: 1,
        group: MotorcycleGroup.GROUP_1,
        status: MotorcycleStatus.AVAILABLE,
        imageUrl: '/images/mt07.jpg',
        requiredLicense: LicenseType.A2,
        isYAMT: false,
      },
    }),
    prisma.motorcycle.create({
      data: {
        model: 'XSR700',
        plateNumber: 'AA-124-BB',
        bikeNumber: 2,
        group: MotorcycleGroup.GROUP_1,
        status: MotorcycleStatus.AVAILABLE,
        imageUrl: '/images/xsr700.jpg',
        requiredLicense: LicenseType.A2,
        isYAMT: false,
      },
    }),
    prisma.motorcycle.create({
      data: {
        model: 'Tracer 7',
        plateNumber: 'AA-125-BB',
        bikeNumber: 3,
        group: MotorcycleGroup.GROUP_1,
        status: MotorcycleStatus.AVAILABLE,
        imageUrl: '/images/tracer7.jpg',
        requiredLicense: LicenseType.A2,
        isYAMT: false,
      },
    }),
  ]);

  // Créer des motos - Groupe 2 (A)
  const motorcycles2 = await Promise.all([
    prisma.motorcycle.create({
      data: {
        model: 'MT-09',
        plateNumber: 'BB-123-CC',
        bikeNumber: 11,
        group: MotorcycleGroup.GROUP_2,
        status: MotorcycleStatus.AVAILABLE,
        imageUrl: '/images/mt09.jpg',
        requiredLicense: LicenseType.A,
        isYAMT: true,
      },
    }),
    prisma.motorcycle.create({
      data: {
        model: 'Tracer 9 GT',
        plateNumber: 'BB-124-CC',
        bikeNumber: 12,
        group: MotorcycleGroup.GROUP_2,
        status: MotorcycleStatus.AVAILABLE,
        imageUrl: '/images/tracer9gt.jpg',
        requiredLicense: LicenseType.A,
        isYAMT: false,
      },
    }),
    prisma.motorcycle.create({
      data: {
        model: 'Ténéré 700',
        plateNumber: 'BB-125-CC',
        bikeNumber: 13,
        group: MotorcycleGroup.GROUP_2,
        status: MotorcycleStatus.AVAILABLE,
        imageUrl: '/images/tenere700.jpg',
        requiredLicense: LicenseType.A,
        isYAMT: false,
      },
    }),
  ]);
  console.log('✓ Motos créées');

  // Créer des événements
  const event1 = await prisma.event.create({
    data: {
      name: 'Demo Ride Tour - Paris Nord',
      type: EventType.DEALERSHIP,
      dealerId: dealer1.id,
      startDate: new Date('2026-03-14T09:00:00'),
      endDate: new Date('2026-03-15T18:00:00'),
      address: dealer1.address,
      city: dealer1.city,
      postalCode: dealer1.postalCode,
      latitude: 48.8566,
      longitude: 2.3522,
      maxSlotsPerSession: 7,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Demo Ride Tour - Lyon Centre',
      type: EventType.DEALERSHIP,
      dealerId: dealer2.id,
      startDate: new Date('2026-03-21T09:00:00'),
      endDate: new Date('2026-03-22T18:00:00'),
      address: dealer2.address,
      city: dealer2.city,
      postalCode: dealer2.postalCode,
      latitude: 45.7640,
      longitude: 4.8357,
      maxSlotsPerSession: 7,
    },
  });
  console.log('✓ Événements créés');

  // Créer des sessions pour l'événement 1 - Jour 1
  const sessions = [];
  const startTimes = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];

  for (const time of startTimes) {
    // Session Groupe 1
    const session1 = await prisma.session.create({
      data: {
        eventId: event1.id,
        group: MotorcycleGroup.GROUP_1,
        startTime: new Date(`2026-03-14T${time}:00`),
        endTime: new Date(new Date(`2026-03-14T${time}:00`).getTime() + 50 * 60000), // +50min
        availableSlots: 7,
        bookedSlots: 0,
        instructorId: instructor1.id,
      },
    });
    sessions.push(session1);

    // Session Groupe 2 (30min décalé)
    const [h, m] = time.split(':').map(Number);
    let newH = h;
    let newM = m + 30;
    if (newM >= 60) {
      newH += 1;
      newM -= 60;
    }
    const offsetTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;

    const session2 = await prisma.session.create({
      data: {
        eventId: event1.id,
        group: MotorcycleGroup.GROUP_2,
        startTime: new Date(`2026-03-14T${offsetTime}:00`),
        endTime: new Date(new Date(`2026-03-14T${offsetTime}:00`).getTime() + 50 * 60000),
        availableSlots: 7,
        bookedSlots: 0,
        instructorId: instructor2.id,
      },
    });
    sessions.push(session2);
  }
  console.log('✓ Sessions créées');

  // Associer les motos aux événements
  for (const moto of [...motorcycles1, ...motorcycles2]) {
    await prisma.motorcycleAvailability.create({
      data: {
        motorcycleId: moto.id,
        eventId: event1.id,
        isAvailable: true,
      },
    });
    await prisma.motorcycleAvailability.create({
      data: {
        motorcycleId: moto.id,
        eventId: event2.id,
        isAvailable: true,
      },
    });
  }
  console.log('✓ Disponibilités motos configurées');

  // Créer quelques clients de test
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'client1@example.com',
        password: await bcrypt.hash('client123', 10),
        firstName: 'Pierre',
        lastName: 'Durand',
        phone: '+33698765432',
        role: UserRole.CLIENT,
        city: 'Paris',
        postalCode: '75001',
        licenseType: LicenseType.A2,
      },
    }),
    prisma.user.create({
      data: {
        email: 'client2@example.com',
        password: await bcrypt.hash('client123', 10),
        firstName: 'Sophie',
        lastName: 'Bernard',
        phone: '+33687654321',
        role: UserRole.CLIENT,
        city: 'Lyon',
        postalCode: '69001',
        licenseType: LicenseType.A,
        currentBrand: 'Honda',
        currentModel: 'CB650R',
      },
    }),
  ]);
  console.log('✓ Clients de test créés');

  console.log('\n✅ Seed terminé avec succès!');
  console.log('\n📝 Informations de connexion:');
  console.log('  Admin: heloise@yamaha.fr / admin123');
  console.log('  Instructeur 1: instructor1@yamaha.fr / instructor123');
  console.log('  Instructeur 2: instructor2@yamaha.fr / instructor123');
  console.log('  Client 1: client1@example.com / client123');
  console.log('  Client 2: client2@example.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
