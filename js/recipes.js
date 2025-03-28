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
      recipeCard.className = 'bg-white rounded-lg shadow-md overflow-hidden w-full md:w-[calc(33.333%-1rem)] min-h-[400px] flex flex-col';

      recipeCard.innerHTML = `
          <div class="p-4 flex-grow flex flex-col">
              <h2 class="font-bold text-lg mb-2 pb-4 line-clamp-2">${recipe.nom}</h2>
              <img src="${recipe.image}" alt="${recipe.nom}" class="h-60 object-cover rounded">
              <p class="text-gray-600 mb-1">${recipe.categorie}</p>
              <p class="text-gray-500 text-sm">⏱ ${recipe.temps_preparation}</p>
              <div class="mt-auto flex justify-between items-center">
                  <button onclick="viewRecipe(${start + index})" class="viewRecipeButton ">Voir la recette </button>
                  <button onclick="toggleFavorite(${index})">♡</button>
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
      <div class="p-4 flex-grow flex flex-col">
        <h2 class="font-bold pb-4">${recipe.nom}</h2>
        <figure class="flex flex-wrap">
          <img src="${recipe.image}" alt="${recipe.nom}" class="max-w-[400px] max-h-[400px] object-cover rounded p-4">
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
          <button class="bg-red" onclick="toggleFavorite(${index})"><3</button>
        </figure>
        
        <h3 class="font-bold">Étapes:</h3>
        <ol class="m-2">
            ${recipe.etapes.map(step => `<li>${step}</li>`).join('')}
        </ol>
        <button onclick="" class="rounded" >  addtoplanning </button>
      </div>
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
      button.innerText = i;
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
  const recipeToToggle = allRecipes[index];

  const exists = favorites.find(fav => fav.nom === recipeToToggle.nom);
  if (exists) {
      favorites = favorites.filter(fav => fav.nom !== recipeToToggle.nom);
  } else {
      favorites.push(recipeToToggle);
  }

  localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
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
