import Database from 'better-sqlite3';

// Ouvrir la base de données SQLite
const db = new Database('./footprog.sqlite');

// Coordonnées de test pour différentes villes
const coordinatesMap = {
  'lille': '50.6292,3.0573',
  'paris': '48.8566,2.3522',
  'lyon': '45.7640,4.8357',
  'marseille': '43.2965,5.3698',
  'DEN-DEN': '50.6292,3.0573' // Utiliser Lille pour ce match de test
};

try {
  console.log('Ajout des coordonnées aux matchs existants...');
  
  // Récupérer tous les matchs
  const matches = db.prepare('SELECT id, title FROM matches').all();
  console.log('Matchs trouvés:', matches);
  
  // Mettre à jour chaque match avec des coordonnées
  for (const match of matches) {
    const title = (match as any).title?.toLowerCase();
    let coordinates = '50.6292,3.0573'; // Coordonnées par défaut (Lille)
    
    // Chercher des coordonnées correspondantes
    for (const [city, coords] of Object.entries(coordinatesMap)) {
      if (title?.includes(city.toLowerCase())) {
        coordinates = coords;
        break;
      }
    }
    
    // Mettre à jour le match
    const stmt = db.prepare('UPDATE matches SET coordinates = ? WHERE id = ?');
    const result = stmt.run(coordinates, (match as any).id);
    
    console.log(`Match ${(match as any).id} (${(match as any).title}) mis à jour avec coordonnées ${coordinates}`);
  }
  
  console.log('Mise à jour terminée avec succès !');
  
} catch (error) {
  console.error('Erreur lors de la mise à jour:', error);
} finally {
  db.close();
}
