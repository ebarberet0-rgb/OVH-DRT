import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUpdateEvent() {
    try {
        // Get the DRT Lyon event
        const event = await prisma.event.findFirst({
            where: { name: { contains: 'DRT Lyon' } },
        });

        if (!event) {
            console.log('❌ Event "DRT Lyon" not found');
            return;
        }

        console.log('\n📍 Current Event Data:');
        console.log(JSON.stringify(event, null, 2));

        // Try to update it
        console.log('\n🔄 Attempting to update event...');
        const updated = await prisma.event.update({
            where: { id: event.id },
            data: {
                latitude: 45.7649325,
                longitude: 4.9019801,
            },
        });

        console.log('\n✅ Event updated successfully!');
        console.log(JSON.stringify(updated, null, 2));

        await prisma.$disconnect();
    } catch (error) {
        console.error('\n❌ Error updating event:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

testUpdateEvent();
