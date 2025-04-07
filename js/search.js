document.addEventListener('DOMContentLoaded', async () => {
    // Récupère le paramètre query dans l'URL
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query') || '';
  
    // Crée une instance de SearchManager avec les sélecteurs adaptés
    const searchManager = new SearchManager({
      containerId: 'recipesContainer',           // Pour afficher les cards
      paginationId: 'pagination',                // Pour la pagination
      modalOverlayId: 'modalOverlay',            // Pour la modale
      modalDetailsId: 'recipeDetails',           // Contenu de la modale
      searchInputSelector: 'input.search-input', // Champ de recherche (s'il existe)
      searchContainerSelector: '.search-container', // Conteneur de la recherche/autocomplétion
      searchResultsSelector: '.search-results',    // Conteneur des résultats de recherche
      recipesUrl: 'data/recipes.json',           // URL du JSON
      recipesPerPage: 9,
      favoriteMode: false
    });
    
    // Charge les recettes et attache les écouteurs
    await searchManager.init();
  
    // Si une query est présente dans l'URL, la placer dans l'input (si présent) et lancer la recherche
    if(query) {
      const input = document.querySelector('input.search-input');
      if(input) {
        input.value = query;
      }
      searchManager.performSearch();
    }
  });
  