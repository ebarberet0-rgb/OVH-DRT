import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'dealer@test.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Resetting password for ${email}...`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'DEALER',
            },
            create: {
                email,
                password: hashedPassword,
                firstName: 'Dealer',
                lastName: 'Test',
                phone: '+33687654321',
                role: 'DEALER',
            },
        });
        console.log(`Successfully reset password for ${user.email}. You can now log in.`);
    } catch (e) {
        console.error('Error updating user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
