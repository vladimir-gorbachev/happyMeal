async function loadRecipes() {
    try {
        const response = await fetch('data/recipes.json'); // Charger le JSON
        const data = await response.json(); // Convertir en objet JS
        return data.recettes; // Retourner les données
    } catch (error) {
        console.error("Erreur lors du chargement des recettes : ", error);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

const recipesPerPage = 9;
let currentPage = 1;
let allRecipes = [];

async function displayRecipes(page = 1) {
    const container = document.getElementById('recipesContainer');
    container.innerHTML = ''; // Vider le conteneur avant d'afficher

    const start = (page - 1) * recipesPerPage;
    const end = start + recipesPerPage;
    const recipesToShow = allRecipes.slice(start, end);

    recipesToShow.forEach((recipe, index) => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <h3>${recipe.nom}</h3>
            <p><strong>Catégorie :</strong> ${recipe.categorie}</p>
            <p><strong>Temps :</strong> ${recipe.temps_preparation}</p>
            <button onclick="viewRecipe(${start + index})">Voir la recette</button>
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
        <p><strong>Catégorie :</strong> ${recipe.categorie}</p>
        <p><strong>Temps de préparation :</strong> ${recipe.temps_preparation}</p>
        <button id="favoriteBtn" onclick="toggleFavorite(${index})">Ajouter aux favoris</button>
        <h3>Ingrédients :</h3>
        <ul>
          ${recipe.ingredients.map(ingredient => {
            const nomIngredientEscaped = ingredient.nom.replace(/'/g, "\\'"); // Échapper les apostrophes dans le onclick
            if (typeof ingredient === 'object' && ingredient.quantite) {
              return `<li>${ingredient.nom} - ${ingredient.quantite} 
                        <button onclick="addToShoppingList('${nomIngredientEscaped}', '${ingredient.quantite}')">Ajouter à la liste</button>
                      </li>`;
            } else if (typeof ingredient === 'object') {
              return `<li>${ingredient.nom} 
                        <button onclick="addToShoppingList('${nomIngredientEscaped}', '1')">Ajouter à la liste</button>
                      </li>`;
            } else {
              return `<li>${ingredient} 
                        <button onclick="addToShoppingList('${nomIngredientEscaped}', '1')">Ajouter à la liste</button>
                      </li>`;
            }
          }).join('')}
        </ul>
        <h3>Étapes :</h3>
        <ol>
            ${recipe.etapes.map(etape => `<li>${etape}</li>`).join('')}
        </ol>
    `;
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
        button.classList.add('pagination-btn');
        if (i === currentPage) button.classList.add('active');

        button.addEventListener('click', () => {
            currentPage = i;
            displayRecipes(i);
        });

        paginationContainer.appendChild(button);
    }
}

function toggleFavorite(index) {
    // Récupérer les favoris existants depuis localStorage
    let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const recipe = allRecipes[index];

    // Vérifier si la recette est déjà dans les favoris (en se basant ici sur le nom par exemple)
    const exists = favorites.find(r => r.nom === recipe.nom);
    if (exists) {
        // Si la recette existe, on la retire
        favorites = favorites.filter(r => r.nom !== recipe.nom);
    } else {
        // Sinon, on l'ajoute
        favorites.push(recipe);
    }
    // Enregistrer la liste mise à jour dans localStorage
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    // Optionnel : mettre à jour l'interface (ex. modifier le bouton)
}


// _____________FAVORITE_RECIPES ___________________________

document.addEventListener("DOMContentLoaded", initFavoriteRecipes);

function initFavoriteRecipes() {
  // Récupérer les recettes favorites enregistrées dans le localStorage
  let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  displayFavoriteRecipes(favorites);
}

function displayFavoriteRecipes(favorites) {
  const container = document.getElementById('favoritesContainer');
  container.innerHTML = ''; // On vide le conteneur avant affichage

  // Si aucune recette favorite n'est enregistrée
  if (favorites.length === 0) {
    container.innerHTML = '<p>Aucune recette favorite n\'a été ajoutée.</p>';
    return;
  }

  // Affichage de chaque recette favorite sous forme de "carte"
  favorites.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
      <h3>${recipe.nom}</h3>
      <p><strong>Catégorie :</strong> ${recipe.categorie}</p>
      <p><strong>Temps :</strong> ${recipe.temps_preparation}</p>
      <button onclick="viewFavoriteRecipe(${index})">Voir la recette</button>
      <button onclick="removeFavorite(${index})">Retirer des favoris</button>
    `;
    container.appendChild(card);
  });
}

function viewFavoriteRecipe(index) {
    // Récupération de la recette favorite à afficher
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const recipe = favorites[index];
    if (!recipe) return;
  
    // Affichage des détails de la recette avec vérification pour l'affichage de la quantité
    const detailsContainer = document.getElementById('recipeDetails');
    detailsContainer.innerHTML = `
      <h2>${recipe.nom}</h2>
      <p><strong>Catégorie :</strong> ${recipe.categorie}</p>
      <p><strong>Temps de préparation :</strong> ${recipe.temps_preparation}</p>
      <h3>Ingrédients :</h3>
      <ul>
        ${recipe.ingredients.map(ingredient => {
            if (typeof ingredient === 'object' && ingredient.quantite) {
              return `<li>${ingredient.nom} - ${ingredient.quantite}</li>`;
            } else if (typeof ingredient === 'object') {
              return `<li>${ingredient.nom}</li>`;
            } else {
              return `<li>${ingredient}</li>`;
            }
        }).join('')}
      </ul>
      <h3>Étapes :</h3>
      <ol>
        ${recipe.etapes.map(etape => `<li>${etape}</li>`).join('')}
      </ol>
    `;
}
  

function removeFavorite(index) {
  // Récupérer les recettes favorites actuelles
  let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  // Retirer la recette à l'index donné
  favorites.splice(index, 1);
  // Mettre à jour le localStorage avec la nouvelle liste
  localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
  // Réafficher la liste mise à jour
  displayFavoriteRecipes(favorites);
}
