// Déclarez la variable manager dans le scope global
let manager;

document.addEventListener("DOMContentLoaded", () => {
  // Affectez l'instance à la variable globale manager
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
  // Si le manager est en mode favoris, recharger les recettes favorites
  if (manager.favoriteMode) {
    manager.allRecipes = FavoriteManager.getFavorites();
  }
  manager.displayRecipes(); // remet à jour l'affichage des cartes
});

