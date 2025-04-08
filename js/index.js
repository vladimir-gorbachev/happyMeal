class IndexRecipeManager extends RecipeManager {
  async init() {
    this.allRecipes = await this.loadRecipes();
    this.allRecipes = this.shuffleRecipes(this.allRecipes);
    this.allRecipes.forEach((recipe, index) => {
      if (!recipe.id) {
        recipe.id = this.generateRecipeId(recipe, index);
      }
    });
    this.displayRecipes();
    this.setupGlobalListeners();
    document.addEventListener('viewRecipe', (e) => {
      this.openModal(this.createModalContent(e.detail));
    });
  }

  shuffleRecipes(recipes) {
    let array = recipes.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const indexManager = new IndexRecipeManager({
    containerId: 'recipesContainer',
    paginationId: 'pagination',
    modalOverlayId: 'modalOverlay',
    modalDetailsId: 'recipeDetails',
    recipesPerPage: 3,
    favoriteMode: false
  });
  indexManager.init();
});
