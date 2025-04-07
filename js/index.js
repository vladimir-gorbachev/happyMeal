// Définition du gestionnaire spécifique à l'index
class IndexRecipeManager extends RecipeManager {
  async init() {
    // Charge les recettes via la méthode héritée
    this.allRecipes = await this.loadRecipes();
    // Mélange aléatoire (méthode propre à l'index)
    this.allRecipes = this.shuffleRecipes(this.allRecipes);
    // Génère un id pour chaque recette si nécessaire
    this.allRecipes.forEach((recipe, index) => {
      if (!recipe.id) {
        recipe.id = this.generateRecipeId(recipe, index);
      }
    });
    // Affiche les recettes avec une pagination à 3 par page
    this.displayRecipes();
    this.setupGlobalListeners();
    document.addEventListener('viewRecipe', (e) => {
      this.openModal(this.createModalContent(e.detail));
    });
  }

  // Fonction de mélange (Fisher-Yates)
  shuffleRecipes(recipes) {
    let array = recipes.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// Initialisation une fois le DOM chargé
document.addEventListener("DOMContentLoaded", () => {
  const indexManager = new IndexRecipeManager({
    containerId: 'recipesContainer',
    paginationId: 'pagination',
    modalOverlayId: 'modalOverlay',
    modalDetailsId: 'recipeDetails',
    recipesPerPage: 3,   // Pagination spécifique à l'index
    favoriteMode: false
  });
  indexManager.init();
});
