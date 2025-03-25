async function loadRecipes() {
  try {
      const response = await fetch('data/recipes.json'); // Load JSON file
      const data = await response.json(); // Convert to JS object
      return data.recettes; // Return recipes
  } catch (error) {
      console.error("Error loading recipes: ", error);
      return []; // Return an empty array in case of error
  }
}

const recipesPerPage = 9;
let currentPage = 1;
let allRecipes = [];

async function displayRecipes(page = 1) {
  const container = document.getElementById('recipesContainer');
  container.innerHTML = ''; // Clear container before displaying recipes

  const start = (page - 1) * recipesPerPage;
  const end = start + recipesPerPage;
  const recipesToShow = allRecipes.slice(start, end);

  recipesToShow.forEach((recipe, index) => {
      const recipeCard = document.createElement('div');
      recipeCard.classList.add('bg-white', 'shadow-lg', 'p-4', 'rounded-lg', 'mb-4');

      recipeCard.innerHTML = `
          <h3 class="text-lg font-semibold">${recipe.nom}</h3>
          <p>Catégorie: ${recipe.categorie}</p>
          <p>Temps de préparation: ${recipe.temps_preparation}</p>
          <button class="bg-blue-500 text-white px-4 py-2 rounded mt-2" onclick="viewRecipe(${start + index})">Voir la recette</button>
      `;

      container.appendChild(recipeCard);
  });

  updatePaginationButtons();
}

function viewRecipe(index) {
  const recipe = allRecipes[index];
  if (!recipe) return;

  const detailsContainer = document.getElementById('recipeDetails');
  detailsContainer.innerHTML = `
      <h2 class="text-2xl font-bold">${recipe.nom}</h2>
      <p>Catégorie: ${recipe.categorie}</p>
      <p>Temps de préparation: ${recipe.temps_preparation}</p>
      <button class="bg-green-500 text-white px-4 py-2 rounded mt-2" id="favoriteBtn" onclick="toggleFavorite(${index})">Ajouter aux favoris</button>
      <h3 class="text-xl font-semibold mt-4">Ingrédients:</h3>
      <ul class="list-none pl-0 ml-5">
        ${recipe.ingredients.map(ingredient => {
          const escapedIngredient = ingredient.nom.replace(/'/g, "\\'");
          return `
            <li>${ingredient.nom} ${ingredient.quantite ? `- ${ingredient.quantite}` : ''}
              <button class="bg-gray-300 text-black px-2 py-1 rounded ml-2" onclick="addToShoppingList('${escapedIngredient}', '${ingredient.quantite || '1'}')">Ajouter</button>
            </li>
          `;
        }).join('')}
      </ul>
      <h3 class="text-xl font-semibold mt-4">Étapes:</h3>
      <ol class="list-decimal ml-5">
          ${recipe.etapes.map(etape => `<li>${etape}</li>`).join('')}
      </ol>
  `;

  openModal();
}

async function initRecipesPage() {
  allRecipes = await loadRecipes();
  displayRecipes();
}

document.addEventListener("DOMContentLoaded", initRecipesPage);

function updatePaginationButtons() {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(allRecipes.length / recipesPerPage);

  for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.innerText = i;
      button.classList.add('px-3', 'py-1', 'rounded', 'border', 'border-gray-300', 'mx-1');
      if (i === currentPage) button.classList.add('bg-blue-500', 'text-white');

      button.addEventListener('click', () => {
          currentPage = i;
          displayRecipes(i);
      });

      paginationContainer.appendChild(button);
  }
}

function toggleFavorite(index) {
  let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  const recipe = allRecipes[index];

  const exists = favorites.find(r => r.nom === recipe.nom);
  if (exists) {
      favorites = favorites.filter(r => r.nom !== recipe.nom);
  } else {
      favorites.push(recipe);
  }

  localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
}

document.addEventListener("DOMContentLoaded", initFavoriteRecipes);

function initFavoriteRecipes() {
  let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  displayFavoriteRecipes(favorites);
}

function displayFavoriteRecipes(favorites) {
  const container = document.getElementById('favoritesContainer');
  container.innerHTML = '';

  if (favorites.length === 0) {
      container.innerHTML = '<p>Pas encore de recettes favorites</p>';
      return;
  }

  favorites.forEach((recipe, index) => {
      const card = document.createElement('div');
      card.classList.add('bg-white', 'shadow-lg', 'p-4', 'rounded-lg', 'mb-4');

      card.innerHTML = `
          <h3 class="text-lg font-semibold">${recipe.nom}</h3>
          <p>Catégorie: ${recipe.categorie}</p>
          <p>Temps de préparation: ${recipe.temps_preparation}</p>
          <button class="bg-blue-500 text-white px-4 py-2 rounded mt-2" onclick="viewFavoriteRecipe(${index})">Voir la recette</button>
          <button class="bg-red-500 text-white px-4 py-2 rounded mt-2" onclick="removeFavorite(${index})">Retirer des favoris</button>
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
      <h2 class="text-2xl font-bold">${recipe.nom}</h2>
      <p>Categorie: ${recipe.categorie}</p>
      <p>Temps de préparation: ${recipe.temps_preparation}</p>
      <h3 class="text-xl font-semibold mt-4">Ingrédients:</h3>
      <ul class="list-none pl-0 ml-5">
          ${recipe.ingredients.map(ingredient => `
              <li>${ingredient.nom} ${ingredient.quantite ? `- ${ingredient.quantite}` : ''}</li>
          `).join('')}
      </ul>
      <h3 class="text-xl font-semibold mt-4">étapes:</h3>
      <ol class="list-decimal ml-5">
          ${recipe.etapes.map(etape => `<li>${etape}</li>`).join('')}
      </ol>
  `;
}

function removeFavorite(index) {
  let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  favorites.splice(index, 1);
  localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
  displayFavoriteRecipes(favorites);
}




// _____________________MODALE ____________________________

function openModal() {
  const modal = document.getElementById("modalOverlay");
  modal.classList.remove("hidden");
  setTimeout(() => {
      modal.classList.remove("opacity-0");
      modal.querySelector("div").classList.remove("scale-95");
  }, 10);
}

function closeModal() {
  const modal = document.getElementById("modalOverlay");
  modal.classList.add("opacity-0");
  modal.querySelector("div").classList.add("scale-95");

  setTimeout(() => {
      modal.classList.add("hidden");
  }, 300);
}

// Fermer la modale en cliquant sur l'overlay
document.getElementById("modalOverlay").addEventListener("click", function(event) {
  if (event.target === this) {
      closeModal();
  }
});

// Fermer la modale avec la touche Échap (Escape)
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
      closeModal();
  }
});
