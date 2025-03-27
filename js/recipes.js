async function loadRecipes() {
  try {
      const response = await fetch('data/recipes.json'); // Load JSON file
      const data = await response.json(); // Convert to JS object
      return data.recettes; // Keep original JSON key
  } catch (error) {
      console.error("Error loading recipes: ", error);
      return []; // Return an empty array in case of error
  }
}

const recipesPerPage = 9;
let currentPage = 1;
let allRecipes = [];

function displayRecipes(page = 1) {
  const container = document.getElementById('recipesContainer');
  container.className = "flex flex-wrap gap-4 justify-center"; 
  container.innerHTML = '';

  const start = (page - 1) * recipesPerPage;
  const end = start + recipesPerPage;
  const recipesToShow = allRecipes.slice(start, end);

  recipesToShow.forEach((recipe, index) => {
      const recipeCard = document.createElement('article');
      recipeCard.className = 'bg-white rounded-lg shadow-md overflow-hidden w-full md:w-[calc(33.333%-1rem)] h-50 flex flex-col'; // 33.33% - gap

      recipeCard.innerHTML = `
          <div class="p-4 flex-grow flex flex-col">
              <h3 class="font-bold text-lg mb-2 line-clamp-2">${recipe.nom}</h3>
              <p class="text-gray-600 mb-1">${recipe.categorie}</p>
              <p class="text-gray-500 text-sm">⏱ ${recipe.temps_preparation}</p>
              <div class="mt-auto flex justify-between items-center">
                  <button onclick="viewRecipe(${start + index})" class="viewRecipeButton ">Voir la recette </button>
                  <button id="favoriteBtn" onclick="toggleFavorite(${index})">♡</button>
              </div>
          </div>
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
      <h2>${recipe.nom}</h2>
      <p>Catégorie: ${recipe.categorie}</p>
      <p>Temps de préparation: ${recipe.temps_preparation}</p>
      <button id="favoriteBtn" onclick="toggleFavorite(${index})">♡</button>
      <h3>Ingrédients:</h3>
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
      <h3>Étapes:</h3>
      <ol>
          ${recipe.etapes.map(step => `<li>${step}</li>`).join('')}
      </ol>
      <button onclick="" class="rounded" >  addtoplanning </button>
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
  paginationContainer.className = "flex justify-center"

  const totalPages = Math.ceil(allRecipes.length / recipesPerPage);

  for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.innerText = i + ",";
      button.className = "p-1"
      if (i === currentPage) button.style.fontWeight = "bold";

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

  const exists = favorites.find(recipe => recipe.nom === recipe.nom);
  if (exists) {
      favorites = favorites.filter(recipe => recipe.nom !== recipe.nom);
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
  container.className = "flex flex-wrap gap-4 justify-center"; // Même layout Flexbox
  container.innerHTML = '';

  if (favorites.length === 0) {
      container.innerHTML = '<p class="text-center w-full py-8 text-gray-500">Pas encore de recettes favorites</p>';
      return;
  }

  favorites.forEach((recipe, index) => {
      const card = document.createElement('article');
      card.className = 'bg-white rounded-lg shadow-md overflow-hidden w-full md:w-[calc(33.333%-1rem)] h-50 flex flex-col'; // Mêmes dimensions

      card.innerHTML = `
          <div class="p-4 flex-grow flex flex-col">
              <h3 class="font-bold text-lg mb-2 line-clamp-2">${recipe.nom}</h3>
              <p class="text-gray-600 mb-1">${recipe.categorie}</p>
              <p class="text-gray-500 text-sm">⏱ ${recipe.temps_preparation}</p>
              <div class="mt-auto flex justify-between items-center">
                  <button onclick="viewRecipe(${allRecipes.findIndex(r => r.nom === recipe.nom)})" class="viewRecipeButton"> Voir la recette </button>
                  <button onclick="removeFavorite(${index})" class="rounded" > ♡ </button>
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
      <h2>${recipe.nom}</h2>
      <p>Temps de préparation: ${recipe.temps_preparation}</p>
      <p>Catégorie: ${recipe.categorie}</p>
      <h3>Ingrédients:</h3>
      <ul>
          ${recipe.ingredients.map(ingredient => `
              <li>${ingredient.nom} ${ingredient.quantite ? `- ${ingredient.quantite}` : ''}</li>
          `).join('')}
      </ul>
      <h3>Étapes:</h3>
      <ol>
          ${recipe.etapes.map(step => `<li>${step}</li>`).join('')}
      </ol>
      <button onclick="" class="rounded" >  add toplanning </button>
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
  modal.style.display = "block";
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
