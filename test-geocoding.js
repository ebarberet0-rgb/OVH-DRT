/**
 * Script de test pour vérifier le géocodage Nominatim amélioré
 * Ce script teste plusieurs adresses françaises réelles
 */

const testAddresses = [
  {
    name: "Concession Paris Centre",
    address: "42 Avenue des Champs-Élysées",
    postalCode: "75008",
    city: "Paris",
    expected: { lat: 48.870, lon: 2.307 } // Approximatif
  },
  {
    name: "Concession Lyon",
    address: "15 Rue de la République",
    postalCode: "69001",
    city: "Lyon",
    expected: { lat: 45.767, lon: 4.836 }
  },
  {
    name: "Concession Marseille",
    address: "10 La Canebière",
    postalCode: "13001",
    city: "Marseille",
    expected: { lat: 43.297, lon: 5.376 }
  },
  {
    name: "Adresse précise avec numéro",
    address: "25 Rue du Faubourg Saint-Honoré",
    postalCode: "75008",
    city: "Paris",
    expected: { lat: 48.870, lon: 2.316 }
  },
  {
    name: "Petite ville",
    address: "1 Place de la Mairie",
    postalCode: "01000",
    city: "Bourg-en-Bresse",
    expected: { lat: 46.205, lon: 5.225 }
  }
];

async function geocodeAddress(address, postalCode, city) {
  const fullAddress = `${address}, ${postalCode} ${city}`;

  const params = new URLSearchParams({
    format: 'json',
    q: fullAddress,
    countrycodes: 'fr',
    addressdetails: '1',
    limit: '3',
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        'User-Agent': 'Yamaha-DRT-App/1.0'
      }
    }
  );

  return await response.json();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Formule de Haversine pour calculer la distance en km
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function runTests() {
  console.log('='.repeat(80));
  console.log('TEST DE GÉOCODAGE NOMINATIM - Yamaha DRT');
  console.log('='.repeat(80));
  console.log('');

  for (const test of testAddresses) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📍 Test: ${test.name}`);
    console.log(`   Adresse: ${test.address}, ${test.postalCode} ${test.city}`);
    console.log('');

    try {
      const results = await geocodeAddress(test.address, test.postalCode, test.city);

      if (results && results.length > 0) {
        const result = results[0];
        const { lat, lon, display_name, importance, type, addresstype, class: osm_class } = result;

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        // Vérification des coordonnées
        const isValidNumber = !isNaN(latitude) && !isNaN(longitude);
        const isInFrance = latitude >= 41 && latitude <= 51 && longitude >= -5 && longitude <= 10;

        // Calcul de la distance par rapport aux coordonnées attendues
        const distance = calculateDistance(
          latitude, longitude,
          test.expected.lat, test.expected.lon
        );

        // Détermination du niveau de qualité
        let quality = 'FAIBLE';
        let qualityIcon = '⚠️';
        if (importance > 0.5) {
          quality = 'HAUTE';
          qualityIcon = '✅';
        } else if (importance > 0.3) {
          quality = 'MOYENNE';
          qualityIcon = '⚡';
        }

        console.log(`${qualityIcon} RÉSULTAT:`);
        console.log(`   Coordonnées trouvées: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        console.log(`   Coordonnées attendues: ${test.expected.lat.toFixed(6)}, ${test.expected.lon.toFixed(6)}`);
        console.log(`   Distance: ${distance.toFixed(2)} km`);
        console.log(`   Adresse complète: ${display_name}`);
        console.log(`   Type: ${type || 'N/A'} / ${addresstype || 'N/A'}`);
        console.log(`   Classe OSM: ${osm_class || 'N/A'}`);
        console.log(`   Score importance: ${importance ? importance.toFixed(4) : 'N/A'}`);
        console.log(`   Qualité: ${quality}`);
        console.log(`   Validité:`);
        console.log(`     - Nombre valide: ${isValidNumber ? '✅' : '❌'}`);
        console.log(`     - En France: ${isInFrance ? '✅' : '❌'}`);
        console.log(`     - Distance < 1km: ${distance < 1 ? '✅' : distance < 5 ? '⚠️' : '❌'}`);

        // Vérification globale
        if (isValidNumber && isInFrance && distance < 5) {
          console.log(`\n   ✅ TEST RÉUSSI - Géocodage précis`);
        } else if (distance < 10) {
          console.log(`\n   ⚠️  TEST PARTIEL - Géocodage approximatif (${distance.toFixed(2)}km de décalage)`);
        } else {
          console.log(`\n   ❌ TEST ÉCHOUÉ - Coordonnées incorrectes`);
        }

        // Afficher les 3 premiers résultats si plusieurs
        if (results.length > 1) {
          console.log(`\n   ℹ️  ${results.length} résultats trouvés (affichage des 3 premiers):`);
          results.slice(0, 3).forEach((r, i) => {
            console.log(`      ${i + 1}. ${r.display_name} (importance: ${r.importance?.toFixed(4) || 'N/A'})`);
          });
        }

      } else {
        console.log('❌ AUCUN RÉSULTAT trouvé');
      }

      // Respecter les limites de taux de l'API Nominatim (1 req/sec)
      await new Promise(resolve => setTimeout(resolve, 1100));

    } catch (error) {
      console.log(`❌ ERREUR: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('FIN DES TESTS');
  console.log('='.repeat(80));
}

// Exécuter les tests
runTests().catch(console.error);
