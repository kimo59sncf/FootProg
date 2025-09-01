// Script simple pour ajouter des coordonnées aux matchs existants
const Database = require('better-sqlite3');

async function updateMatchCoordinates() {
  const db = new Database('./footprog.sqlite');
  
  console.log('Mise à jour des coordonnées des matchs...');
  
  // Coordonnées de test pour les villes
  const coordinatesMap = {
    'lille': '50.6292,3.0573',
    'paris': '48.8566,2.3522',
    'lyon': '45.7640,4.8357',
    'marseille': '43.2965,5.3698'
  };
  
  try {
    // Récupérer tous les matchs
    const matches = db.prepare('SELECT id, title, location, coordinates FROM matches').all();
    console.log(`Trouvé ${matches.length} match(s)`);
    
    for (const match of matches) {
      let coordinates = null;
      const location = match.location.toLowerCase();
      
      // Déterminer les coordonnées basées sur la localisation
      if (location.includes('lille')) {
        coordinates = coordinatesMap.lille;
      } else if (location.includes('paris')) {
        coordinates = coordinatesMap.paris;
      } else if (location.includes('lyon')) {
        coordinates = coordinatesMap.lyon;
      } else if (location.includes('marseille')) {
        coordinates = coordinatesMap.marseille;
      } else {
        // Coordonnées par défaut (Paris)
        coordinates = coordinatesMap.paris;
      }
      
      // Mettre à jour le match avec les coordonnées
      const updateStmt = db.prepare('UPDATE matches SET coordinates = ? WHERE id = ?');
      updateStmt.run(coordinates, match.id);
      
      console.log(`✅ Match ${match.id} (${match.title} - ${match.location}) mis à jour avec coordonnées: ${coordinates}`);
    }
    
    // Vérifier les résultats
    console.log('\nVérification des coordonnées mises à jour:');
    const updatedMatches = db.prepare('SELECT id, title, location, coordinates FROM matches').all();
    updatedMatches.forEach(match => {
      console.log(`- Match ${match.id}: ${match.title} (${match.location}) -> ${match.coordinates || 'Pas de coordonnées'}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    db.close();
  }
}

// Exécuter le script
updateMatchCoordinates().then(() => {
  console.log('\n🎉 Mise à jour terminée !');
}).catch(console.error);
