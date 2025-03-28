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
  container.className = "flex flex-wrap gap-4 justify-center"; 
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
  const card = createElement('article', [
    'bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 
    'w-full', 'md:w-[calc(33.333%-1rem)]', 'min-h-[400px]', 'flex', 'flex-col'
  ]);

  const content = createElement('div', ['p-4', 'flex-grow', 'flex', 'flex-col']);
  
  // Titre
  const title = createElement('h2', ['font-bold', 'text-lg', 'mb-2', 'pb-2', 'line-clamp-2']);
  title.textContent = recipe.nom;

  // Image
  const img = createElement('img', ['h-60', 'object-cover', 'rounded' ,'pt-6']);
  img.src = recipe.image;
  img.alt = recipe.nom;

  // Métadonnées
  const category = createElement('p', ['text-gray-600', 'mb-1']);
  category.textContent = recipe.categorie;

  const time = createElement('p', ['text-gray-500', 'text-sm']);
  time.textContent = `⏱ ${recipe.temps_preparation}`;

  // Boutons
  const viewButton = createElement('button', ['viewRecipeButton']);
  viewButton.textContent = 'Voir la recette';
  viewButton.addEventListener('click', () => viewRecipe(index));

  // const favButton = createElement('button');
  // favButton.textContent = '♡';
  // favButton.addEventListener('click', () => toggleFavorite(index));

  // Assemblage
  content.append(title, img, category, time, createButtonsContainer(viewButton));
  card.appendChild(content);
  return card;
}

function createButtonsContainer(...buttons) {
  const container = createElement('div', ['mt-auto', 'flex', 'justify-between', 'items-center']);
  container.append(...buttons);
  return container;
}

function updatePaginationButtons() {
  const pagination = document.getElementById('pagination');
  pagination.className = "flex justify-center";
  pagination.innerHTML = '';

  const totalPages = Math.ceil(allRecipes.length / recipesPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = createElement('button', ['p-1'], {}, []);
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
  const content = createElement('div', ['p-4', 'flex-grow', 'flex', 'flex-col']);

  // Titre
  const title = createElement('h2', ['font-bold', 'pb-4']);
  title.textContent = recipe.nom;

  // Figure principale
  const figure = createElement('figure', ['flex', 'flex-wrap']);

  // Image
  const img = createElement('img', ['max-w-[450px]', 'max-h-[400px]', 'object-cover', 'rounded', 'p-4']);
  img.src = recipe.image;
  img.alt = recipe.nom;

  // Légende
  const figCaption = createElement('figcaption');
  figCaption.classList = "pl-6 max-w-[450px] flex justify-space-between flex-wrap";

  // Catégorie
  const category = createElement('h3', ['pb-4']);
  category.innerHTML = `<span class="font-bold">Catégorie</span> : ${recipe.categorie}`;

  // Temps de préparation
  const time = createElement('p', ['pb-4']);
  time.innerHTML = `<span class="font-bold">Temps de préparation:</span> ${recipe.temps_preparation}`;
  time.classList="w-full pb-4";

  // Ingrédients
  const ingredientsTitle = createElement('h3');
  ingredientsTitle.textContent = "Ingrédients: ";
  ingredientsTitle.classList ="w-full font-bold pb-2";
  const ingredientsList = createElement('ul', ['w-full']);
  recipe.ingredients.forEach(ingredient => {
    const li = createElement('li');
    
    
    // Texte ingrédient
    const ingredientText = document.createTextNode(
      `${ingredient.nom} ${ingredient.quantite ? `- ${ingredient.quantite}` : ''}`
    );
    ingredientText.classList="w-full justify-space-between"
    
    // Bouton d'ajout
    const addButton = createElement('button', ['ml-2', 'text-blue-500']);
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
  const stepsTitle = createElement('h3', ['font-bold', 'mt-4']);
  stepsTitle.textContent = 'Étapes:';

  const stepsList = createElement('ol', ['m-2']);
  stepsList.classList="list-decimal p-6";
  recipe.etapes.forEach(step => {
    const li = createElement('li');
    li.textContent = step;
    li.classList="p-2";
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