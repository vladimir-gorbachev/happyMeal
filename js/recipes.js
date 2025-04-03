function createElement(tag, classes = [], attributes = {}, children = []) {
  const element = document.createElement(tag);
  if (classes.length) element.classList.add(...classes);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  children.forEach(child => element.appendChild(child));
  return element;
}

async function loadRecipes() {
  try {
      const response = await fetch('data/recipes.json');
      const data = await response.json();
      return data.recettes;
  } catch (error) {
      console.error("Error loading recipes: ", error);
      return [];
  }
}

const recipesPerPage = 9;
let currentPage = 1;
let allRecipes = [];

async function initRecipesPage() {
  allRecipes = await loadRecipes();
  displayRecipes();
  setupGlobalListeners();
}

document.addEventListener("DOMContentLoaded", initRecipesPage);

function displayRecipes(page = 1) {
  const container = document.getElementById('recipesContainer');
  container.innerHTML = '';

  currentPage = page;
  const start = (page - 1) * recipesPerPage;
  const recipesToShow = allRecipes.slice(start, start + recipesPerPage);

  recipesToShow.forEach((recipe, index) => {
      const globalIndex = start + index;
      const card = createRecipeCard(recipe, globalIndex);
      container.appendChild(card);
  });

  updatePaginationButtons();
}

function createRecipeCard(recipe, index) {
  const card = createElement('article', ['recipe-card']);
  const content = createElement('div', ['recipe-card-content']);
  
  // Titre
  const title = createElement('h2');
  title.textContent = recipe.nom;

  // Image
  const img = createElement('img');
  img.src = recipe.image;
  img.alt = recipe.nom;

  // Métadonnées
  const category = createElement('p', ['category']);
  category.textContent = recipe.categorie;

  const time = createElement('p', ['time']);
  time.textContent = `⏱ ${recipe.temps_preparation}`;

  // Boutons
  const viewButton = createElement('button', ['viewRecipeButton']);
  viewButton.textContent = 'Voir la recette';
  viewButton.addEventListener('click', () => viewRecipe(index));

  // Assemblage
  content.append(title, img, category, time, createButtonsContainer(viewButton));
  card.appendChild(content);
  return card;
}

function createButtonsContainer(...buttons) {
  const container = createElement('div', ['buttons-container']);
  container.append(...buttons);
  return container;
}

function updatePaginationButtons() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const totalPages = Math.ceil(allRecipes.length / recipesPerPage);

  for (let i = 1; i <= totalPages; i++) {
      const button = createElement('button');
      button.textContent = i;
      if (i === currentPage) button.style.fontWeight = "bold";
      button.addEventListener('click', () => displayRecipes(i));
      pagination.appendChild(button);
  }
}

function toggleFavorite(index) {
  const favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  const recipe = allRecipes[index];
  
  const exists = favorites.find(fav => fav.nom === recipe.nom);
  exists ? favorites.splice(favorites.indexOf(exists), 1) : favorites.push(recipe);
  
  localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
}

function viewRecipe(index) {
  const recipe = allRecipes[index];
  if (!recipe) return;

  const modalContent = createModalContent(recipe, index);
  const modal = document.getElementById('recipeDetails');
  modal.innerHTML = '';
  modal.appendChild(modalContent);
  openModal();
}

function createModalContent(recipe, index) {
  const content = createElement('div', ['recipe-details']);

  // Titre
  const title = createElement('h2');
  title.textContent = recipe.nom;

  // Figure principale
  const figure = createElement('figure');

  // Image
  const img = createElement('img');
  img.src = recipe.image;
  img.alt = recipe.nom;

  // Légende
  const figCaption = createElement('figcaption');

  // Catégorie
  const category = createElement('h3');
  category.innerHTML = `<span style="font-weight:bold">Catégorie</span> : ${recipe.categorie}`;

  // Temps de préparation
  const time = createElement('p');
  time.innerHTML = `<span style="font-weight:bold">Temps de préparation:</span> ${recipe.temps_preparation}`;

  // Ingrédients
  const ingredientsTitle = createElement('h3');
  ingredientsTitle.textContent = "Ingrédients: ";
  const ingredientsList = createElement('ul');
  recipe.ingredients.forEach(ingredient => {
      const li = createElement('li');
      
      // Texte ingrédient
      const ingredientText = document.createTextNode(
          `${ingredient.nom} ${ingredient.quantite ? `- ${ingredient.quantite}` : ''}`
      );
      
      // Bouton d'ajout
      const addButton = createElement('button');
      addButton.textContent = 'Ajouter';
      addButton.addEventListener('click', () => {
          const escapedIngredient = ingredient.nom.replace(/'/g, "\\'");
          addToShoppingList(escapedIngredient, ingredient.quantite || '1');
      });

      li.append(ingredientText, addButton);
      ingredientsList.appendChild(li);
  });

  // Assemblage figcaption
  figCaption.append(category, time, ingredientsTitle, ingredientsList);

  // Étapes de préparation
  const stepsTitle = createElement('h3');
  stepsTitle.textContent = 'Étapes:';

  const stepsList = createElement('ol');
  recipe.etapes.forEach(step => {
      const li = createElement('li');
      li.textContent = step;
      stepsList.appendChild(li);
  });

  // Assemblage final
  figure.append(img, figCaption);
  content.append(
      title, 
      figure, 
      stepsTitle, 
      stepsList,
  );

  return content;
}

function openModal() {
  document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

function setupGlobalListeners() {
  // Fermeture modale
  document.getElementById("modalOverlay").addEventListener('click', (e) => {
      if (e.target === document.getElementById("modalOverlay")) closeModal();
  });

  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
  });
}

// Fonction pour ajouter à la liste de courses (à implémenter)
function addToShoppingList(ingredient, quantity) {
  console.log(`Ajouté à la liste de courses: ${quantity} ${ingredient}`);
  // Implémentation à compléter
}