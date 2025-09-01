import Database from 'better-sqlite3';

const db = new Database('./footprog.sqlite');

try {
  console.log('📋 Tables existantes dans la base de données:');
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
  tables.forEach(table => console.log(`  - ${table.name}`));

  console.log('\n📊 Nombre d\'utilisateurs:');
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log(`  - ${userCount.count} utilisateurs`);
  } catch (e) {
    console.log('  - Table users non trouvée ou erreur');
  }

  console.log('\n⚽ Nombre de matchs:');
  try {
    const matchCount = db.prepare('SELECT COUNT(*) as count FROM matches').get();
    console.log(`  - ${matchCount.count} matchs`);
  } catch (e) {
    console.log('  - Table matches non trouvée ou erreur');
  }

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  db.close();
}
