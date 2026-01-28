@echo off
echo ========================================
echo  Creation de reservations de demo
echo ========================================
echo.

echo [1/1] Execution du script...
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const sessions=await p.session.findMany();const users=await p.user.findMany({where:{role:'CLIENT'}});const motos=await p.motorcycle.findMany();let count=0;for(let i=0;i<20;i++){const s=sessions[Math.floor(Math.random()*sessions.length)];const u=users[Math.floor(Math.random()*users.length)];const m=motos[Math.floor(Math.random()*motos.length)];const statuses=['CONFIRMED','CONFIRMED','COMPLETED','PENDING'];const status=statuses[Math.floor(Math.random()*statuses.length)];try{if(s.bookedSlots<s.availableSlots){await p.booking.create({data:{userId:u.id,sessionId:s.id,motorcycleId:m.id,status:status}});await p.session.update({where:{id:s.id},data:{bookedSlots:{increment:1}}});count++;console.log('  Reservation '+count+' creee');}}catch(e){}}console.log('\nTotal: '+count+' reservations');await p.$disconnect();})();"

echo.
echo ========================================
echo  Termine !
echo ========================================
echo.
pause
