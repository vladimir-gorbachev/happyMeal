document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('query')?.trim();

    // Results
    const searchResultsContainer = document.getElementById("search-results-container");
    searchResultsContainer.className = "recipes-container";
    
    if (!searchTerm) {
        searchResultsContainer.innerHTML = `<p class="no-results">Veuillez entrer un terme de recherche valide.</p>`;
        return;
    }
    
    const normalizeText = (text) => 
        text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || '';
    
    const normalizedSearchTerm = normalizeText(searchTerm);
    
    searchResultsContainer.innerHTML = `<p class="loading-message">Recherche en cours...</p>`;

    function createElement(tag, classes = [], attributes = {}, children = []) {
        const element = document.createElement(tag);
        if (classes.length) element.classList.add(...classes);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        children.forEach(child => element.appendChild(child));
        return element;
    }

    function createRecipeCard(recipe, index) {
        const card = createElement('article', ['recipe-card']);
      
        const content = createElement('div', ['recipe-card-content']);

        const title = createElement('h2', ['recipe-title']);
        title.textContent = recipe.nom;
      
        const img = createElement('img', ['recipe-image']);
        img.src = recipe.image;
        img.alt = recipe.nom;
      
        const category = createElement('p', ['recipe-category']);
        category.textContent = recipe.categorie;
      
        const time = createElement('p', ['recipe-time']);
        time.textContent = `⏱ ${recipe.temps_preparation}`;
      
        const viewButton = createElement('button', ['view-recipe-button']);
        viewButton.textContent = 'Voir la recette';
        viewButton.addEventListener('click', () => viewRecipe(index));
      
        const favButton = createFavButton(recipe, index);
      
        const buttonsContainer = createButtonsContainer(viewButton, favButton);
      
        content.append(title, img, category, time, buttonsContainer);
        card.appendChild(content);
      
        img.addEventListener('click', () => viewRecipe(index));
      
        return card;
    }

    function createFavButton(recipe, index) {
        const favorites = (JSON.parse(localStorage.getItem('favoriteRecipes')) || [])
        .filter(fav => fav && typeof fav === 'object' && fav?.nom);
        const isFavorite = favorites.find(fav => fav?.nom === recipe.nom);
        const fillColor = isFavorite ? 'red' : '#D3D3D3';
      
        // fav button
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
          { 'data-recipe-index': index } // data attribute 
        );
        favButton.type = 'button';
      
        favButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fillColor}" class="w-4 h-4">
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
        `;
  
        favButton.addEventListener('click', () => toggleFavorite(index));
      
        return favButton;
    }
      
    function createButtonsContainer(...buttons) {
        const container = createElement('div', ['flex','justify-between','w-full']);
        container.append(...buttons);
        return container;
    }

    
    function toggleFavorite(index) {
        const favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
        const recipe = results[index];
    
        const favButtons = document.querySelectorAll(`.favorite-button[data-recipe-index="${index}"]`);
        
        const exists = favorites.find(fav => fav?.nom === recipe.nom);
        if (exists) {
  
        favorites.splice(favorites.indexOf(exists), 1);

        favButtons.forEach(button => {
            const svg = button.querySelector('svg');
            if (svg) {
            svg.setAttribute('fill', '#D3D3D3');
            }
        });
        } else {
        favorites.push(recipe);
        // svg fill
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
        const recipe = results[index];
        if (!recipe) return;
    
        const modalContent = createModalContent(recipe, index);
        const modal = document.getElementById('recipeDetails');
        modal.innerHTML = '';
        modal.appendChild(modalContent);
        openModal();
    }
    
    function createModalContent(recipe, index) {
        const content = createElement('div', ['recipe-details']);
    
        // Title
        const title = createElement('h2');
        title.textContent = recipe.nom;
    
        // Figure
        const figure = createElement('figure', ['flex', 'flex-wrap', 'justify-between']);
    
        // Image
        const img = createElement('img', ['max-w-[550px]', 'max-h-[400px]', 'rounded', 'object-cover', 'p-4', 'flex', 'flex-shrink', 'flex-grow']);
        img.src = recipe.image;
        img.alt = recipe.nom;
    
        // figcaption
        const figCaption = createElement('figcaption');
        figCaption.classList = "pl-3 pr-3 max-w-[450px] flex justify-space-between flex-wrap flex-grow";
    
        // Category
        const category = createElement('h3',['w-full']);
        category.innerHTML = `<span style="font-weight:bold">Catégorie</span> : ${recipe.categorie}`;
    
        // Time
        const time = createElement('p');
        time.innerHTML = `<span style="font-weight:bold">Temps de préparation:</span> ${recipe.temps_preparation}`;
    
        // Ingredients
        const ingredientsTitle = createElement('h3');
        ingredientsTitle.textContent = "Ingrédients: ";
        ingredientsTitle.classList = "w-full font-bold pb-2";
    
        const ingredientsList = createElement('ul');
        ingredientsList.classList="w-full"
        recipe.ingredients.forEach(ingredient => {
        const li = createElement('li');
        li.classList="w-full flex wrap justify-between"

        const ingredientSpan = createElement('span');
        if (ingredient.quantite) {
            ingredientSpan.textContent = `${ingredient.quantite} - ${ingredient.nom}`;
        } else {
            ingredientSpan.textContent = `${ingredient}`;
        }
        
        const addToListButton = createElement('button', ['ml-2', 'text-blue-500', 'rounded-xl','p-1', 'border']);
        addToListButton.textContent = 'Ajouter';
        addToListButton.addEventListener('click', () => {
            const escapedIngredient = ingredient.nom.replace(/'/g, "\\'");
            addToShoppingList(escapedIngredient, ingredient.quantite || '1');
        });
    
        li.append(ingredientSpan, addToListButton);
        ingredientsList.appendChild(li);
        });
    
        // FAV BUTTON
        const favButton = createFavButton(recipe, index);
        favButton.classList.add('absolute', 'top-3', 'right-[45px]');
    
        // figcaption
        figCaption.append(category, time, ingredientsTitle, ingredientsList);
    
        // STEPS
        const stepsTitle = createElement('h3',['pb-3','font-bold']);
        stepsTitle.textContent = 'Étapes:';
    
        const stepsList = createElement('ol');
        recipe.etapes.forEach(step => {
            const li = createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
        });
    
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
        document.getElementById("modalOverlay").addEventListener('click', (e) => {
            if (e.target === document.getElementById("modalOverlay")) closeModal();
        });
    
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }


    // Loading recipes
    let results = [];
    (async () => {
        setupGlobalListeners();
        try {
            const response = await fetch("data/recipes.json");
            if (!response.ok) throw new Error('Erreur réseau');
            const data = await response.json();
            const recipes = data.recettes;

            // Filter results
            results = recipes.filter(recipe => {
                const nameMatch = normalizeText(recipe.nom).includes(normalizedSearchTerm);
                const ingredientMatch = recipe.ingredients.some(ing => 
                    normalizeText(ing.nom).includes(normalizedSearchTerm));
                const descriptionMatch = normalizeText(recipe.description).includes(normalizedSearchTerm);
                return nameMatch || ingredientMatch || descriptionMatch;
            });

            // Display results
            searchResultsContainer.innerHTML = '';

            if (results.length === 0) {
                searchResultsContainer.innerHTML = `<p class="no-results">Aucune recette trouvée pour "${searchTerm}".</p>`;
            } else {
                const resultsTitle = document.createElement('h2');
                resultsTitle.className = "results-title";
                resultsTitle.textContent = `${results.length} résultat(s) trouvé(s) pour "${searchTerm}"`;
                searchResultsContainer.appendChild(resultsTitle);

                results.forEach((recipe, index) => {
                    const card = createRecipeCard(recipe, index);
                    searchResultsContainer.appendChild(card);
                });
            }
        } catch (error) {
            console.error("Erreur:", error);
            searchResultsContainer.innerHTML = `<p class="error-message">Une erreur est survenue lors de la recherche.</p>`;
        }
    })();
});