document.addEventListener("DOMContentLoaded", async function() {
    try {
      const response = await fetch('header.html');
      if (!response.ok) throw new Error('Header non chargé');
      const headerData = await response.text();
      document.querySelector('header').outerHTML = headerData;
    } catch (error) {
      console.error('Erreur lors du chargement du header:', error);
    }
  
    // Vérification des éléments de recherche
    console.log("Input:", document.querySelector(".search-input"));
    console.log("Search container:", document.querySelector(".search-container"));
    console.log("Results container:", document.querySelector(".search-results"));
    

    const searchInput = document.querySelector("input.search-input");
    if (!searchInput) {
    console.error("L'input de recherche n'est pas présent dans le DOM.");
    return;
  }
    // Initialisation unique de SearchManager (attention à ne pas doubler cette étape)
    const searchContainer = document.querySelector(".search-container");
    const searchResults = document.querySelector(".search-results");
  
    if (searchInput && searchContainer && searchResults) {
      const searchManager = new SearchManager({
        containerId: 'recipesContainer',
        paginationId: 'pagination',
        modalOverlayId: 'modalOverlay',
        modalDetailsId: 'recipeDetails',
        searchInputSelector: "input.search-input",
        searchContainerSelector: ".search-container",
        searchResultsSelector: ".search-results",
        recipesUrl: "data/recipes.json",
        recipesPerPage: 9,
        favoriteMode: false
      });
      await searchManager.init();
    } else {
      console.error("Les éléments de recherche ne sont pas présents dans le DOM.");
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('query') || '';

    if (query) {
        searchInput.value = query;
        searchManager.performSearch();
    }
});
  