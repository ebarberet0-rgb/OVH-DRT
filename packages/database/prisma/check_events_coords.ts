import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEventCoordinates() {
    try {
        const events = await prisma.event.findMany({
            select: {
                id: true,
                name: true,
                city: true,
                address: true,
                latitude: true,
                longitude: true,
            },
        });

        console.log('\n📍 Événements et leurs coordonnées GPS:\n');
        events.forEach((event, index) => {
            console.log(`${index + 1}. ${event.name}`);
            console.log(`   Ville: ${event.city}`);
            console.log(`   Adresse: ${event.address}`);
            console.log(`   Latitude: ${event.latitude} (type: ${typeof event.latitude})`);
            console.log(`   Longitude: ${event.longitude} (type: ${typeof event.longitude})`);
            console.log(`   Valide pour la carte: ${event.latitude && event.longitude ? '✅ OUI' : '❌ NON'}`);
            console.log('');
        });

        await prisma.$disconnect();
    } catch (error) {
        console.error('Erreur:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

checkEventCoordinates();
