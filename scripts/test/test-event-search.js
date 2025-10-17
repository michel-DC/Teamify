const fetch = require('node-fetch');

async function testEventSearch() {
  console.log('🧪 Test de la recherche d\'événements...\n');

  try {
    // Test avec une requête vide
    console.log('1. Test avec requête vide:');
    const emptyResponse = await fetch('http://localhost:3000/api/search/events?q=');
    const emptyData = await emptyResponse.json();
    console.log('   Status:', emptyResponse.status);
    console.log('   Résultat:', emptyData);
    console.log('   ✅ Réponse attendue: tableau vide\n');

    // Test avec une requête valide
    console.log('2. Test avec requête valide:');
    const searchResponse = await fetch('http://localhost:3000/api/search/events?q=test');
    const searchData = await searchResponse.json();
    console.log('   Status:', searchResponse.status);
    console.log('   Résultat:', searchData);
    console.log('   ✅ Réponse attendue: tableau d\'événements ou tableau vide\n');

    // Test avec caractères spéciaux
    console.log('3. Test avec caractères spéciaux:');
    const specialResponse = await fetch('http://localhost:3000/api/search/events?q=événement%20spécial');
    const specialData = await specialResponse.json();
    console.log('   Status:', specialResponse.status);
    console.log('   Résultat:', specialData);
    console.log('   ✅ Réponse attendue: gestion correcte des caractères spéciaux\n');

    console.log('🎉 Tests de recherche d\'événements terminés!');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  testEventSearch();
}

module.exports = { testEventSearch };
