import { storageFactory } from './server/storage-factory';

async function updateMatchCoordinates() {
  try {
    console.log('Mise à jour des coordonnées des matchs...');
    
    // Force l'utilisation de SQLite
    const storage = storageFactory(true); // true pour forcer SQLite
    
    // Coordonnées de test pour les villes
    const coordinatesMap = {
      'lille': '50.6292,3.0573',
      'paris': '48.8566,2.3522',
      'lyon': '45.7640,4.8357',
      'marseille': '43.2965,5.3698'
    };
    
    // Récupérer les matchs existants
    const matches = await storage.getAllMatches();
    console.log(`Trouvé ${matches.length} match(s) à mettre à jour`);
    
    for (const match of matches) {
      // Déterminer les coordonnées basées sur la localisation
      let coordinates = null;
      const location = match.location.toLowerCase();
      
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
      
      // Mise à jour du match avec les coordonnées
      await storage.updateMatch(match.id, {
        coordinates: coordinates
      });
      console.log(`Match ${match.id} (${match.title} - ${match.location}) mis à jour avec coordonnées: ${coordinates}`);
    }
    
    // Mise à jour du match 2 (Paris)
    await storage.updateMatch(2, {
      coordinates: coordinatesMap.paris
    });
    console.log('Match 2 (Paris) mis à jour avec coordonnées');
    
    console.log('Mise à jour terminée !');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

updateMatchCoordinates();
