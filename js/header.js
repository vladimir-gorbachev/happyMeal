let allRecipes = [];

function createElement(tag, classes = [], attributes = {}, children = []) {
    const element = document.createElement(tag);
    if (classes.length) element.classList.add(...classes);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    children.forEach(child => element.appendChild(child));
    return element;
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

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('header.html');
        if (!response.ok) throw new Error('Header non chargé');

        const data = await response.text();
        document.querySelector('header').outerHTML = data;
    } catch (error) {
        console.error('Erreur:', error);
    }
    setupGlobalListeners();
    initSearchSystem();
});

async function initSearchSystem() {
    const searchInput = document.querySelector(".search-input");
    const searchContainer = document.querySelector(".search-container");
    const resultsContainer = document.querySelector(".search-results");

    if (!searchInput || !searchContainer || !resultsContainer) return;

    allRecipes = [];
    let normalizedRecipes = [];
    let searchTimer;
    const searchCache = {};

    async function loadRecipes() {
        try {
            const response = await fetch("data/recipes.json");
            if (!response.ok) throw new Error("Fichier JSON non trouvé");

            const data = await response.json();
            console.log(`${data.recettes.length} recettes chargées`);
            return data.recettes;
        } catch (error) {
            console.error("Erreur:", error);
            return [];
        }
    }

    const normalizeText = (text) => text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || '';

    allRecipes = await loadRecipes();
    normalizedRecipes = allRecipes.map(recipe => ({
        original: recipe,
        nom: normalizeText(recipe.nom),
        ingredients: recipe.ingredients.map(ing => normalizeText(ing.nom))
    }));

    function performSearch() {
        const searchTerm = normalizeText(searchInput.value.trim());
        if (searchTerm.length < 2) {
            resultsContainer.style.display = "none";
            return;
        }

        if (searchCache[searchTerm]) {
            displayResults(searchCache[searchTerm]);
            return;
        }

        const results = normalizedRecipes
            .filter(recipe =>
                recipe.nom.includes(searchTerm) ||
                recipe.ingredients.some(ing => ing.includes(searchTerm))
            )
            .map(r => r.original);

        searchCache[searchTerm] = results;
        displayResults(results);
    }

    function displayResults(results) {
        resultsContainer.innerHTML = results.length === 0
            ? `<div class="no-results">Aucune recette trouvée pour "${searchInput.value}"</div>`
            : results.map((recipe, index) => `
                <div class="recipe-result" data-index="${allRecipes.indexOf(recipe)}">
                    <h3>${recipe.nom}</h3>
                    <div class="recipe-meta">
                        <span class="category">${recipe.categorie}</span>
                        <span class="time">${recipe.temps_preparation}</span>
                    </div>
                    <div class="ingredients-list">
                        ${recipe.ingredients.map(ing => ing.quantite ? `${ing.quantite} ${ing.nom}` : ing).join(', ')}
                    </div>
                </div>
            `).join('');
    
        resultsContainer.style.display = "block";
    
        // 🔥 Ajout d'un event listener sur chaque recette après affichage
        document.querySelectorAll(".recipe-result").forEach(item => {
            item.addEventListener("click", function () {
                const index = this.getAttribute("data-index");  // Récupérer l'index
                viewRecipe(index);  // Appelle `viewRecipe` pour ouvrir la modale
            });
        });
    }
    

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(performSearch, 300);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === "Enter" && searchInput.value.trim().length > 1) {
            window.location.href = `search_results.html?query=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = "none";
            searchInput.value = "";
        }
    });

       
    function viewRecipe(index) {
        const recipe = allRecipes[index];   
        if (!recipe) {
            console.error("Recette introuvable !");
            return;
        }

        const modalContent = createModalContent(recipe, index);
        const modal = document.getElementById('recipeDetails');
        modal.innerHTML = '';
        modal.appendChild(modalContent);
        openModal();
    }

    function createModalContent(recipe, index) {
        const content = createElement('div', ['recipe-details']);

        // Titre
        const title = createElement('h1');
        title.textContent = recipe.nom;
        

        // Figure principale
        const figure = createElement('figure', ['flex', 'flex-wrap', 'justify-between']);

        // Image
        const img = createElement('img', ['max-w-[550px]', 'max-h-[400px]', 'rounded', 'object-cover', 'p-4', 'flex', 'flex-shrink', 'flex-grow']);
        img.src = recipe.image;
        img.alt = recipe.nom;

        // Légende
        const figCaption = createElement('figcaption');
        figCaption.classList = "pl-3 pr-3 max-w-[450px] flex justify-space-between flex-wrap flex-grow";

        // Catégorie
        const category = createElement('h3',['w-full']);
        category.innerHTML = `<span style="font-weight:bold">Catégorie</span> : ${recipe.categorie}`;

        // Temps de préparation
        const time = createElement('p');
        time.innerHTML = `<span style="font-weight:bold">Temps de préparation:</span> ${recipe.temps_preparation}`;

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
        const addToListButton = createElement('button', ['ml-2', 'text-blue-500', 'rounded-xl','p-1', 'border']);
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
        const stepsTitle = createElement('h3',['pb-3','font-bold']);
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
}

 