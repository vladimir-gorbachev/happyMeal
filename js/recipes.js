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

function createFavButton(recipe, index) {
  // Récupérer les favoris depuis localStorage
  const favorites = (JSON.parse(localStorage.getItem('favoriteRecipes')) || [])
  .filter(fav => fav && typeof fav === 'object' && fav?.nom);
  const isFavorite = favorites.find(fav => fav?.nom === recipe.nom);
  // Choisir la couleur du fill : rouge si favorite, sinon currentColor (ou noir, par exemple)
  const fillColor = isFavorite ? 'red' : '#D3D3D3';

  // Création du bouton favoris avec une classe commune et un data attribute pour l'index
  const favButton = createElement(
    'button',
    [
      'favorite-button', // classe commune pour tous les boutons favoris
      'max-w-[37px]',
      
      'top-5',
      'rounded-full',
      'border',
      'p-2.5',
      'text-center',
      'text-sm',
      'transition-all',
      'text-slate-600',
      'active:text-white',
      'disabled:pointer-events-none'
    ],
    { 'data-recipe-index': index } // data attribute pour identifier la recette
  );
  favButton.type = 'button';

  // Insertion du SVG dans le bouton en utilisant fillColor
  favButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fillColor}" class="w-4 h-4">
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  `;

  // Lier l'événement pour basculer l'état favorite
  favButton.addEventListener('click', () => toggleFavorite(index));

  return favButton;
}

function createButtonsContainer(...buttons) {
  const container = createElement('div', ['flex','justify-between']);
  container.append(...buttons);
  return container;
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
  const img = createElement('img', ['h-60', 'object-cover', 'rounded-xl' ,'pt-6']);
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

  const favButton = createFavButton(recipe, index);

  const buttonsContainer = createButtonsContainer(viewButton, favButton);

  // Assemblage final
  content.append(title, img, category, time, buttonsContainer);
  card.appendChild(content);

  card.addEventListener('click', () => viewRecipe(index));

  return card;
}

function toggleFavorite(index) {
  const favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  const recipe = allRecipes[index];

  const favButtons = document.querySelectorAll(`.favorite-button[data-recipe-index="${index}"]`);
  
  const exists = favorites.find(fav => fav?.nom === recipe.nom);
  if (exists) {
    // Si la recette est déjà favorite, on la retire
    favorites.splice(favorites.indexOf(exists), 1);
    // Remettre le fill du SVG à sa valeur par défaut
    favButtons.forEach(button => {
      const svg = button.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', 'currentColor');
      }
    });
  } else {
    // Sinon, on ajoute la recette aux favoris
    favorites.push(recipe);
    // Changer le fill du SVG en rouge
    favButtons.forEach(button => {
      const svg = button.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', 'red');
      }
    });
  }
  
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
  const figure = createElement('figure', ['flex', 'flex-wrap', 'justify-around']);

  // Image
  const img = createElement('img', ['max-w-[550px]', 'max-h-[400px]', 'rounded', 'object-cover', 'p-4', 'flex', 'flex-shrink', 'flex-grow']);
  img.src = recipe.image;
  img.alt = recipe.nom;

  // Légende
  const figCaption = createElement('figcaption');
  figCaption.classList = "pl-3 pr-3 max-w-[450px] flex justify-space-between flex-wrap flex-grow";

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
  ingredientsTitle.classList = "w-full font-bold pb-2";

  const ingredientsList = createElement('ul');
  ingredientsList.classList="w-full"
  recipe.ingredients.forEach(ingredient => {
    const li = createElement('li');
    li.classList="w-full flex wrap justify-between"

    // Création d'un <span> pour le texte de l'ingrédient
    const ingredientSpan = createElement('span');
    if (ingredient.quantite) {
      ingredientSpan.textContent = `${ingredient.quantite} - ${ingredient.nom}`;
    } else {
      ingredientSpan.textContent = `${ingredient}`;
    }
    
    // Bouton d'ajout
    const addToListButton = createElement('button', ['ml-2', 'text-blue-500', 'button', 'rounded-xl','p-1', 'border']);
    addToListButton.textContent = 'Ajouter';
    addToListButton.addEventListener('click', () => {
      const escapedIngredient = ingredient.nom.replace(/'/g, "\\'");
      addToShoppingList(escapedIngredient, ingredient.quantite || '1');
    });

    li.append(ingredientSpan, addToListButton);
    ingredientsList.appendChild(li);
  });

  // Bouton favoris créé via la fonction externalisée
  const favButton = createFavButton(recipe, index);
  // Pour la modale, on peut ajuster la position du bouton
  favButton.classList.add('absolute', 'top-3', 'right-[45px]');

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
    favButton,  
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