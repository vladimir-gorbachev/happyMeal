
document.addEventListener("DOMContentLoaded", initFavoriteRecipes);

function initFavoriteRecipes() {
  let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  displayFavoriteRecipes(favorites);
}

function displayFavoriteRecipes(favorites) {
  const container = document.getElementById('favoritesContainer');
  container.className = "flex flex-wrap gap-4 justify-center";
  container.innerHTML = '';

  if (favorites.length === 0) {
      container.innerHTML = '<p class="text-center w-full py-8 text-gray-500">Pas encore de recettes favorites</p>';
      return;
  }

  favorites.forEach((recipe, index) => {
    const card = document.createElement('article');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden w-full md:w-[calc(33.333%-1rem)] h-50 flex flex-col';

    card.innerHTML = `
        <div class="p-4 flex-grow flex flex-col">
            <h2>${recipe.nom}</h2>
            <img src="${recipe.image}" alt="${recipe.nom}" class="w-4/5 h-40 object-cover rounded">
            <h3>${recipe.categorie}</h3>
            <p>⏱ ${recipe.temps_preparation}</p>
            <div class="mt-auto flex justify-between items-center">
                <button onclick="viewFavoriteRecipe(${index})" class="viewRecipeButton"> Voir la recette </button>
                <button onclick="removeFavorite(${index})" class="rounded"> ♡ </button>
            </div>
        </div>
    `;

    container.appendChild(card);
  });

}

function viewFavoriteRecipe(index) {
  const favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  const recipe = favorites[index];
  if (!recipe) return;

  const detailsContainer = document.getElementById('recipeDetails');
  detailsContainer.innerHTML = `
      <div class="p-4 flex-grow flex flex-col">
        <h2 class="font-bold pb-4">${recipe.nom}</h2>
        <figure class="flex">
          <img src="${recipe.image}" alt="${recipe.nom}" class="w-1/2 max-h-80 object-cover rounded p-4">
          <figcaption>
            <h3 class="pb-4"><span class="font-bold">Catégorie </span> : ${recipe.categorie}</h3>
            <p class="pb-4"><span class="font-bold">Temps de préparation:</span> ${recipe.temps_preparation}</p>
            <h3 class="font-bold">Ingrédients:</h3>
            <ul>
              ${recipe.ingredients.map(ingredient => {
                const escapedIngredient = ingredient.nom.replace(/'/g, "\\'");
                return `
                  <li>${ingredient.nom} ${ingredient.quantite ? `- ${ingredient.quantite}` : ''}
                    <button onclick="addToShoppingList('${escapedIngredient}', '${ingredient.quantite || '1'}')">Ajouter</button>
                  </li>
                `;
              }).join('')}
            </ul>          
          </figcaption>
        </figure>
        
        <h3 class="font-bold">Étapes:</h3>
        <ol class="m-2">
          ${recipe.etapes.map((step, index) => `<li>${index + 1}. ${step}</li>`).join('')}
        </ol>
        <button onclick="" class="btn rounded"> add to planning </button>
      </div>
  `;

  openModal();
}

function removeFavorite(index) {
  let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  favorites.splice(index, 1);
  localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
  displayFavoriteRecipes(favorites);
}

// _____________________MODAL ____________________________

function openModal() {
  const modal = document.getElementById("modalOverlay");
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("modalOverlay");
  modal.style.display = "none";
}

// Close modal when clicking on the overlay
document.getElementById("modalOverlay").addEventListener("click", function(event) {
  if (event.target === this) {
      closeModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
      closeModal();
  }
});
