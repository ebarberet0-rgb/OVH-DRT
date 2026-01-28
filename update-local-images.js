const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Chemins locaux des images
const motorcycleImages = {
  'XSR700': '/images/xsr700.jpg',
  'Tracer 7': '/images/tracer7.jpg',
  'MT-07': '/images/mt07.jpg',
  'Ténéré 700': '/images/tenere700.jpg',
  'Tracer 9 GT': '/images/tracer9gt.jpg',
  'MT-09': '/images/mt09.jpg',
};

async function main() {
  console.log('\n=== VÉRIFICATION DES IMAGES ===');

  const imagesDir = path.join(__dirname, 'apps', 'web', 'public', 'images');
  const missingImages = [];

  // Vérifier que toutes les images existent
  for (const [model, imageUrl] of Object.entries(motorcycleImages)) {
    const filename = path.basename(imageUrl);
    const filePath = path.join(imagesDir, filename);

    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filename} trouvé`);
    } else {
      console.log(`❌ ${filename} MANQUANT`);
      missingImages.push(filename);
    }
  }

  if (missingImages.length > 0) {
    console.log('\n⚠️  IMAGES MANQUANTES:');
    missingImages.forEach(img => console.log(`   - ${img}`));
    console.log('\nVeuillez télécharger ces images et les placer dans:');
    console.log(imagesDir);
    console.log('\nPuis relancez ce script.');
    return;
  }

  console.log('\n=== MISE À JOUR DE LA BASE DE DONNÉES ===');

  for (const [model, imageUrl] of Object.entries(motorcycleImages)) {
    const result = await prisma.motorcycle.updateMany({
      where: { model: model },
      data: { imageUrl: imageUrl },
    });

    if (result.count > 0) {
      console.log(`✅ ${model}: ${imageUrl}`);
    }
  }

  console.log('\n✅ Terminé! Les images locales sont maintenant configurées.');
  console.log('Rafraîchissez la page du frontend pour voir les changements.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
