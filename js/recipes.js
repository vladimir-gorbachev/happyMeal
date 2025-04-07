let manager;

document.addEventListener("DOMContentLoaded", () => {
  manager = new RecipeManager({
    containerId: 'recipesContainer',
    paginationId: 'pagination',
    modalOverlayId: 'modalOverlay',
    modalDetailsId: 'recipeDetails',
    recipesPerPage: 9,
    favoriteMode: false
  });
  manager.init();
});

// ✅ Listen to the event and refresh the cards when favorites change
window.addEventListener('favoritesUpdated', () => {
  if (manager) {
    manager.displayRecipes(); // remet à jour l'affichage des cartes
  }
});
