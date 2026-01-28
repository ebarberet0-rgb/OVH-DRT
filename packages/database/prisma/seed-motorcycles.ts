import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Liste complète des motos Yamaha 2025 disponibles pour le Demo Ride Tour
const yamahaMotorcycles = [
  // =============== PERMIS A - SPORT ===============
  {
    model: 'YZF-R1',
    plateNumber: 'AB-123-CD',
    bikeNumber: 1,
    group: 'GROUP_1',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'YZF-R7',
    plateNumber: 'AB-124-CD',
    bikeNumber: 2,
    group: 'GROUP_1',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1599819177272-e96ed43bdc0b?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'MT-09',
    plateNumber: 'AB-125-CD',
    bikeNumber: 3,
    group: 'GROUP_2',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1558980664-10e7170b5df9?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'MT-10',
    plateNumber: 'AB-126-CD',
    bikeNumber: 4,
    group: 'GROUP_2',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
    status: 'AVAILABLE'
  },

  // =============== PERMIS A - ROADSTER ===============
  {
    model: 'XSR900',
    plateNumber: 'AB-127-CD',
    bikeNumber: 5,
    group: 'GROUP_1',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'XSR700',
    plateNumber: 'AB-128-CD',
    bikeNumber: 6,
    group: 'GROUP_2',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },

  // =============== PERMIS A - TOURING ===============
  {
    model: 'Tracer 9 GT',
    plateNumber: 'AB-129-CD',
    bikeNumber: 7,
    group: 'GROUP_1',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'Ténéré 700',
    plateNumber: 'AB-130-CD',
    bikeNumber: 8,
    group: 'GROUP_2',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80',
    status: 'AVAILABLE'
  },

  // =============== PERMIS A2 - COMPATIBLES ===============
  {
    model: 'MT-07',
    plateNumber: 'AB-131-CD',
    bikeNumber: 9,
    group: 'GROUP_1',
    requiredLicense: 'A2',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1599819177272-e96ed43bdc0b?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'YZF-R3',
    plateNumber: 'AB-132-CD',
    bikeNumber: 10,
    group: 'GROUP_2',
    requiredLicense: 'A2',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'XSR700 (A2)',
    plateNumber: 'AB-133-CD',
    bikeNumber: 11,
    group: 'GROUP_1',
    requiredLicense: 'A2',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },

  // =============== PERMIS A1 - 125cc ===============
  {
    model: 'MT-125',
    plateNumber: 'AB-134-CD',
    bikeNumber: 12,
    group: 'GROUP_2',
    requiredLicense: 'A1',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1599819177272-e96ed43bdc0b?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'YZF-R125',
    plateNumber: 'AB-135-CD',
    bikeNumber: 13,
    group: 'GROUP_1',
    requiredLicense: 'A1',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80',
    status: 'AVAILABLE'
  },

  // =============== SCOOTERS Y-AMT (Automatique) ===============
  {
    model: 'TMAX 560 Tech MAX',
    plateNumber: 'AB-136-CD',
    bikeNumber: 14,
    group: 'GROUP_1',
    requiredLicense: 'A',
    isYAMT: true,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'XMAX 300',
    plateNumber: 'AB-137-CD',
    bikeNumber: 15,
    group: 'GROUP_2',
    requiredLicense: 'A2',
    isYAMT: true,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'NMAX 125',
    plateNumber: 'AB-138-CD',
    bikeNumber: 16,
    group: 'GROUP_1',
    requiredLicense: 'A1',
    isYAMT: true,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },

  // =============== MOTOS SUPPLÉMENTAIRES ===============
  {
    model: 'MT-09 SP',
    plateNumber: 'AB-139-CD',
    bikeNumber: 17,
    group: 'GROUP_1',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1558980664-10e7170b5df9?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'Tracer 7 GT',
    plateNumber: 'AB-140-CD',
    bikeNumber: 18,
    group: 'GROUP_2',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'XSR900 GP',
    plateNumber: 'AB-141-CD',
    bikeNumber: 19,
    group: 'GROUP_1',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },
  {
    model: 'FJR1300',
    plateNumber: 'AB-142-CD',
    bikeNumber: 20,
    group: 'GROUP_2',
    requiredLicense: 'A',
    isYAMT: false,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    status: 'AVAILABLE'
  },
];

async function seedMotorcycles() {
  console.log('🏍️  Ajout des motos Yamaha...');

  try {
    // Supprimer les motos existantes
    const deletedCount = await prisma.motorcycle.deleteMany({});
    console.log(`✅ ${deletedCount.count} motos supprimées`);

    // Ajouter les nouvelles motos
    let count = 0;
    for (const moto of yamahaMotorcycles) {
      await prisma.motorcycle.create({
        data: moto as any,
      });
      count++;
      console.log(`  ✓ ${moto.model} (Permis ${moto.requiredLicense}${moto.isYAMT ? ' - Y-AMT' : ''})`);
    }

    console.log(`\n✅ ${count} motos Yamaha ajoutées avec succès !`);
    console.log('\n📊 Résumé:');
    console.log(`   - Permis A: ${yamahaMotorcycles.filter(m => m.requiredLicense === 'A').length} modèles`);
    console.log(`   - Permis A2: ${yamahaMotorcycles.filter(m => m.requiredLicense === 'A2').length} modèles`);
    console.log(`   - Permis A1: ${yamahaMotorcycles.filter(m => m.requiredLicense === 'A1').length} modèles`);
    console.log(`   - Boîte automatique (Y-AMT): ${yamahaMotorcycles.filter(m => m.isYAMT).length} modèles`);
    console.log(`   - Groupe 1: ${yamahaMotorcycles.filter(m => m.group === 'GROUP_1').length} motos`);
    console.log(`   - Groupe 2: ${yamahaMotorcycles.filter(m => m.group === 'GROUP_2').length} motos`);

    // Récupérer tous les événements
    const events = await prisma.event.findMany();

    if (events.length > 0) {
      console.log(`\n🔗 Association des motos aux ${events.length} événements...`);

      const motorcycles = await prisma.motorcycle.findMany();

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

      console.log(`✅ Toutes les motos sont disponibles pour tous les événements !`);
    } else {
      console.log('\n⚠️  Aucun événement trouvé. Les motos ne sont pas associées à des événements.');
      console.log('   Exécutez le seed principal pour créer des événements.');
    }

  } catch (error) {
    console.error('❌ Erreur lors du seed des motos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seed
seedMotorcycles()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
