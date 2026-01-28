
import { PrismaClient } from '@yamaha-drt/database';

const prisma = new PrismaClient();

async function main() {
    const event = await prisma.event.findFirst({
        where: {
            name: {
                contains: 'DEMO Paris'
            }
        },
        include: {
            sessions: {
                include: {
                    _count: {
                        select: { bookings: true }
                    }
                }
            }
        }
    });

    if (!event) {
        console.log('Event "DEMO Paris" not found');
        return;
    }

    console.log(`Found event: ${event.name} (${event.id})`);
    console.log(`Start Date: ${event.startDate}`);
    console.log(`End Date: ${event.endDate}`);
    console.log(`Total Sessions: ${event.sessions.length}`);

    const bookingsCount = event.sessions.reduce((acc, s) => acc + s._count.bookings, 0);
    console.log(`Total Bookings: ${bookingsCount}`);

    event.sessions.forEach(s => {
        if (s._count.bookings > 0) {
            console.log(`Session ${s.startTime.toISOString()} has ${s._count.bookings} bookings`);
        }
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
