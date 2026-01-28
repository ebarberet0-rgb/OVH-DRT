
import { PrismaClient } from '@yamaha-drt/database';
import { addMinutes, setHours, setMinutes, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    const event = await prisma.event.findFirst({
        where: {
            name: { contains: 'DEMO Paris' }
        },
        include: {
            sessions: {
                include: {
                    bookings: true
                }
            }
        }
    });

    if (!event) {
        console.log('Event not found');
        return;
    }

    console.log(`Fixing event: ${event.name}`);

    // 1. Generate correct session start times
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const newSessionsData: any[] = [];

    // We need to iterate by days
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Morning: 9, 10, 11
        [9, 10, 11].forEach(hour => {
            const start = setMinutes(setHours(new Date(d), hour), 0);
            const end = addMinutes(start, 45); // 45 min duration

            // Create for Group 1
            newSessionsData.push({
                eventId: event.id,
                startTime: start,
                endTime: end, // 45 min ride
                availableSlots: event.maxSlotsPerSession,
                group: 'GROUP_1'
            });
            // Create for Group 2
            newSessionsData.push({
                eventId: event.id,
                startTime: start,
                endTime: end,
                availableSlots: event.maxSlotsPerSession,
                group: 'GROUP_2'
            });
        });

        // Afternoon: 14, 15, 16, 17
        [14, 15, 16, 17].forEach(hour => {
            const start = setMinutes(setHours(new Date(d), hour), 0);
            const end = addMinutes(start, 45);

            // Create for Group 1
            newSessionsData.push({
                eventId: event.id,
                startTime: start,
                endTime: end,
                availableSlots: event.maxSlotsPerSession,
                group: 'GROUP_1'
            });
            // Create for Group 2
            newSessionsData.push({
                eventId: event.id,
                startTime: start,
                endTime: end,
                availableSlots: event.maxSlotsPerSession,
                group: 'GROUP_2'
            });
        });
    }

    console.log(`Generated ${newSessionsData.length} new sessions targets.`);

    // 2. Create new sessions and keep track of them
    // We'll map "Time + Group" to SessionID
    const createdSessionsMap = new Map<string, string>(); // Key: "ISOString-Group", Value: ID

    for (const s of newSessionsData) {
        // Check if session already exists (unlikely in this broken state, but good practice)
        // Actually we want to force create NEW ones to be clean, and delete old ones.
        const created = await prisma.session.create({
            data: s
        });
        const key = `${s.startTime.toISOString()}-${s.group}`;
        createdSessionsMap.set(key, created.id);
    }

    console.log('Created new sessions.');

    // 3. Move bookings
    let bookingsMoved = 0;
    for (const oldSession of event.sessions) {
        if (oldSession.bookings.length > 0) {
            // Find sensible new home for these bookings
            // Logic: Find new session on SAME DAY with CLOSEST time and SAME GROUP

            const oldStart = new Date(oldSession.startTime);

            // Find closest Time in newSessionsData
            let closestDiff = Infinity;
            let bestMatchKey = '';
            let bestMatchTimeStr = '';

            // Look at our map keys to find best match
            for (const [key, newId] of createdSessionsMap.entries()) {
                const [timeStr, group] = key.split('-');
                if (group !== oldSession.group) continue;

                const newStart = new Date(timeStr);
                // Check if same day
                if (newStart.getDate() !== oldStart.getDate()) continue;
                if (newStart.getMonth() !== oldStart.getMonth()) continue;

                const diff = Math.abs(newStart.getTime() - oldStart.getTime());
                if (diff < closestDiff) {
                    closestDiff = diff;
                    bestMatchKey = key;
                    bestMatchTimeStr = timeStr;
                }
            }

            if (bestMatchKey) {
                const newSessionId = createdSessionsMap.get(bestMatchKey);
                const newTimeSlotStr = format(new Date(bestMatchTimeStr), 'HH:mm'); // e.g. "10:00"

                for (const booking of oldSession.bookings) {
                    console.log(`Moving booking ${booking.id} from ${oldSession.startTime.toISOString()} to ${bestMatchKey}`);
                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: {
                            sessionId: newSessionId,
                            timeSlot: newTimeSlotStr // Update the string representation too
                        }
                    });
                    bookingsMoved++;
                }
            } else {
                console.warn(`Could not find a matching new session for old session ${oldSession.startTime.toISOString()} (Group ${oldSession.group}). Bookings may be orphaned/deleted if we delete session!`);
            }
        }
    }

    console.log(`Moved ${bookingsMoved} bookings.`);

    // 4. Delete old sessions
    // We delete ALL sessions from the event that are NOT in our `createdSessionsMap` values.
    // Wait, we just created them attached to the event.
    // So we re-fetch the sessions or just filter the list we already have (oldSession IDs).

    const oldSessionIds = event.sessions.map(s => s.id);

    // We must delete bookings that were NOT moved? No, we moved them.
    // But wait, if we explicitly disconnect bookings, we can delete sessions safely.
    // If Cascade delete is on, we're fine.
    // If not, we might error.
    // Let's assume we moved the bookings out of these sessions.

    const result = await prisma.session.deleteMany({
        where: {
            id: { in: oldSessionIds }
        }
    });

    console.log(`Deleted ${result.count} old sessions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
