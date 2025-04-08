let manager;

document.addEventListener("DOMContentLoaded", () => {
  manager = new RecipeManager({
    containerId: 'favoritesContainer',
    paginationId: 'pagination',
    modalOverlayId: 'modalOverlay',
    modalDetailsId: 'recipeDetails',
    recipesPerPage: 9,
    favoriteMode: true
  });

  manager.init();
});

window.addEventListener('favoritesUpdated', () => {
  if (manager.favoriteMode) {
    manager.allRecipes = FavoriteManager.getFavorites();
  }
  manager.displayRecipes();
});

