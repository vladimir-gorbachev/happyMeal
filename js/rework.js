class RecipeManager {
    constructor(options) {
      this.container = document.getElementById(options.containerId); // ex.: 'recipesContainer'
      this.pagination = document.getElementById(options.paginationId); // ex.: 'pagination'
      this.modalOverlay = document.getElementById(options.modalOverlayId); // ex.: 'modalOverlay'
      this.modalDetails = document.getElementById(options.modalDetailsId); // ex.: 'recipeDetails'
      this.recipesPerPage = options.recipesPerPage || 9;
      this.currentPage = 1;
      this.allRecipes = [];
      // Si true, on affichera uniquement les recettes favorites (pour favorite_recipes.html)
      this.favoriteMode = options.favoriteMode || false;

      this.setupGlobalListeners();
    }
  
    async init() {
      if (this.favoriteMode) {
        this.allRecipes = this.loadFavorites();
      } else {
        this.allRecipes = await this.loadRecipes();
      }
      // Pour chaque recette, générer un id unique (si non présent)
      this.allRecipes.forEach((recipe, index) => {
        if (!recipe.id) {
          recipe.id = this.generateRecipeId(recipe, index);
        }
      });
      this.displayRecipes();
      this.setupGlobalListeners();
      // Écouteur global pour l'ouverture de modale depuis une RecipeCard
      document.addEventListener('viewRecipe', (e) => {
        this.openModal(this.createModalContent(e.detail));
      });
    }
  
    async loadRecipes() {
      try {
        const response = await fetch('data/recipes.json');
        const data = await response.json();
        return data.recettes;
      } catch (error) {
        console.error("Error loading recipes:", error);
        return [];
      }
    }
  
    loadFavorites() {
      // Charge les recettes favorites depuis localStorage
      return JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    }
  
    generateRecipeId(recipe, index) {
      // Génère un identifiant basé sur le nom (minuscules, espaces remplacés) et l'index
      return recipe.nom.toLowerCase().replace(/\s+/g, '-') + '-' + index;
    }
  
    displayRecipes(page = 1) {
      this.currentPage = page;
      this.container.innerHTML = '';
      const start = (page - 1) * this.recipesPerPage;
      const recipesToShow = this.allRecipes.slice(start, start + this.recipesPerPage);
      recipesToShow.forEach(recipe => {
        const card = new RecipeCard(recipe);
        this.container.appendChild(card.render());
      });
      this.updatePaginationButtons();
    }
  
    updatePaginationButtons() {
      this.pagination.innerHTML = '';
      const totalPages = Math.ceil(this.allRecipes.length / this.recipesPerPage);
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === this.currentPage) btn.style.fontWeight = "bold";
        btn.addEventListener('click', () => this.displayRecipes(i));
        this.pagination.appendChild(btn);
      }
    }
  
    setupGlobalListeners() {
      // Fermeture de la modale au clic sur l'overlay ou sur la touche Escape
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) this.closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });
    }
  
    createModalContent(recipe) {
      // Construction de la modale à partir d'une recette
      const content = document.createElement('div');
      content.className = "recipe-details";
      
      const title = document.createElement('h2');
      title.textContent = recipe.nom;
      title.classList.add = "w-full";

      const category = document.createElement('h3');
      category.innerHTML = `${recipe.categorie}`;
      category.classList = "w-full";

      // Bouton favoris dans la modale (on réutilise la RecipeCard pour créer ce bouton)
      const favButton = new RecipeCard(recipe).createFavButton();
      favButton.classList.add('absolute', 'top-3', 'right-[25px]');
      
      
      const figure = document.createElement('figure');
      figure.className = "flex flex-wrap";
      
      const img = document.createElement('img');
      img.src = recipe.image;
      img.alt = recipe.nom;
      img.className = "w-[500px] max-h-[400px] sm-rounded object-cover p-4";
      
      const figCaption = document.createElement('figcaption');
      figCaption.className = "p-3 max-w-[450px] flex justify-space-between flex-wrap";
      
      const time = document.createElement('p');
      time.innerHTML = `<span style="font-weight:bold">Temps de préparation:</span> ${recipe.temps_preparation}`;
      
      const ingredientsTitle = document.createElement('h3');
      ingredientsTitle.textContent = "Ingrédients:";
      ingredientsTitle.className = "w-full font-bold pb-2";
      
      const ingredientsList = document.createElement('ul');
      ingredientsList.className = "w-full";
      recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.className = "w-full flex wrap justify-between mb-2";
        const ingredientp = document.createElement('p');
        ingredientp.textContent = ingredient.quantite ? `${ingredient.quantite} - ${ingredient.nom}` : ingredient;
        // Bouton pour ajouter à la liste de courses
        const addToListButton = document.createElement('button');
        addToListButton.className = "ml-2 text-blue-500 h-full jutify-center rounded p-1 border hover:bg-sky-700";
        addToListButton.textContent = "Ajouter";
        addToListButton.addEventListener('click', () => {
          // Appelle ta fonction d'ajout (à adapter)
          addToShoppingList(ingredient.nom, ingredient.quantite || '1');
        });
        li.append(ingredientp, addToListButton);
        ingredientsList.appendChild(li);
      });

      // Étapes
      const stepsTitle = document.createElement('h3');
      stepsTitle.textContent = "Étapes:";
      stepsTitle.className = "pb-3 font-bold";
      
      const stepsList = document.createElement('ol');
      stepsList.classList = "list-decimal list-inside";
      recipe.etapes.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsList.appendChild(li);
      });
      
      figCaption.append(time, ingredientsTitle, ingredientsList, stepsTitle, stepsList);
      figure.append(img, figCaption);
      
      content.append(title,category, favButton, figure);
      return content;
    }
  
    openModal(content) {
      this.modalDetails.innerHTML = '';
      this.modalDetails.appendChild(content);
      this.modalOverlay.style.display = "flex";
    }
  
    closeModal() {
      this.modalOverlay.style.display = "none";
    }
}




class SearchManager extends RecipeManager{
    constructor(options) {
      // Sélecteurs et URL passés en options
      super(options);
      this.searchInput = document.querySelector(options.searchInputSelector);
      this.searchContainer = document.querySelector(options.searchContainerSelector);
      this.resultsContainer = document.querySelector(options.searchResultsSelector);
      this.recipesUrl = options.recipesUrl || "data/recipes.json";
      
      // Tableaux pour stocker les recettes et leurs versions normalisées
      this.allRecipes = [];
      this.normalizedRecipes = [];
      
      // Cache et timer pour la recherche
      this.searchCache = {};
      this.searchTimer = null;
    }
  
    async init() {
      if (!this.searchInput || !this.searchContainer || !this.resultsContainer) return;
      await this.loadRecipes();
      this.attachListeners();
    }
  
    async loadRecipes() {
      try {
        const response = await fetch(this.recipesUrl);
        if (!response.ok) throw new Error("Fichier JSON non trouvé");
        const data = await response.json();
        this.allRecipes = data.recettes;
        // Normalisation pour faciliter la recherche (noms et ingrédients)
        this.normalizedRecipes = this.allRecipes.map(recipe => ({
          original: recipe,
          nom: this.normalizeText(recipe.nom),
          ingredients: recipe.ingredients.map(ing => this.normalizeText(ing.nom))
        }));
        console.log(`${this.allRecipes.length} recettes chargées`);
      } catch (error) {
        console.error("Erreur:", error);
        this.allRecipes = [];
        this.normalizedRecipes = [];
      }
    }
  
    normalizeText(text) {
      return text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    }
  
    attachListeners() {
      // Lance la recherche avec un délai de 300 ms après la saisie
      this.searchInput.addEventListener('input', () => {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.performSearch(), 300);
      });
  
      // Redirige si l'utilisateur appuie sur Enter
      this.searchInput.addEventListener('keypress', (e) => {
        if (e.key === "Enter" && this.searchInput.value.trim().length > 1) {
          window.location.href = `search_results.html?query=${encodeURIComponent(this.searchInput.value.trim())}`;
        }
      });
  
      // Ferme les résultats si l'utilisateur clique en dehors de la zone de recherche
      document.addEventListener('click', (e) => {
        if (!this.searchContainer.contains(e.target) && !this.resultsContainer.contains(e.target)) {
          this.resultsContainer.style.display = "none";
          this.searchInput.value = "";
        }
      });
    }
  
    performSearch() {
        const searchTerm = this.normalizeText(this.searchInput.value.trim());
        if (searchTerm.length < 2) {
          this.resultsContainer.style.display = "none";
          return;
        }
      
        // On utilise this.allRecipes (ou this.normalizedRecipes si vous voulez utiliser les versions normalisées)
        const results = this.normalizedRecipes
          .filter(recipe =>
            recipe.nom.includes(searchTerm) ||
            recipe.ingredients.some(ing => ing.includes(searchTerm))
          )
          .map(r => r.original);
      
        // On stocke le résultat dans le cache et on affiche
        this.searchCache[searchTerm] = results;
        this.displayResults(results);
    }
  
    displayResults(results) {
      if (results.length === 0) {
        this.resultsContainer.innerHTML = `<div class="no-results">Aucune recette trouvée pour "${this.searchInput.value}"</div>`;
      } else {
        this.resultsContainer.innerHTML = `<h2 class="results-title">${results.length} résultat(s) trouvé(s) pour "${this.searchInput.value}"</h2>`;

        this.resultsContainer.innerHTML = results.map((recipe) => {
          // On utilise l'index de la recette dans allRecipes pour le data-index
          const index = this.allRecipes.indexOf(recipe);
          return `
            <div class="recipe-result" data-index="${index}">
              <h3>${recipe.nom}</h3>
              <div class="recipe-meta">
                <span class="category">${recipe.categorie}</span>
                <span class="time">${recipe.temps_preparation}</span>
              </div>
              <div class="ingredients-list">
                ${recipe.ingredients.map(ing => ing.quantite ? `${ing.quantite} ${ing.nom}` : ing).join(', ')}
              </div>
            </div>
          `;
        }).join('');
      }
      this.resultsContainer.style.display = "block";
  
      // Ajoute un écouteur de clic sur chaque résultat pour ouvrir la modale
      document.querySelectorAll(".recipe-result").forEach(item => {
        item.addEventListener("click", () => {
          const index = item.getAttribute("data-index");
          this.viewRecipe(index);
        });
      });
    }
  
    viewRecipe(index) {
      const recipe = this.allRecipes[index];
      if (!recipe) {
        console.error("Recette introuvable !");
        return;
      }
      const modalContent = this.createModalContent(recipe);
      this.openModal(modalContent);
    }
}



  
class FavoriteManager {
    static getFavorites() {
      return JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    }
  
    static saveFavorites(favorites) {
      localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    }
  
    static toggleFavorite(recipe) {
      let favorites = FavoriteManager.getFavorites();
      const existingIndex = favorites.findIndex(fav => fav.id === recipe.id);
      let isFavorite = false;
  
      if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1); // remove from favorites
      } else {
        favorites.push(recipe); // add to favorites
        isFavorite = true;
      }
  
      FavoriteManager.saveFavorites(favorites);
  
      // ✅ Dispatch custom event to update UI
      const event = new CustomEvent('favoritesUpdated');
      window.dispatchEvent(event);
  
      return isFavorite;
    }  
}

window.addEventListener('favoritesUpdated', () => {
    // Récupère la liste actuelle des favoris depuis le localStorage
    const favorites = FavoriteManager.getFavorites();

    // Parcourt tous les boutons favoris présents dans le DOM
    document.querySelectorAll('.favorite-button').forEach(btn => {
        const recipeId = btn.getAttribute('data-recipe-id');
        const isFavorite = favorites.find(fav => fav.id === recipeId);
        
        // Met à jour le remplissage du SVG en fonction de l’état
        const svg = btn.querySelector('svg');
        if (svg) {
            svg.setAttribute('fill', isFavorite ? 'red' : '#D3D3D3');
        }
    });
});   




class RecipeCard {
    constructor(recipe) {
      this.recipe = recipe;
    }
  
    createElement(tag, classes = [], attributes = {}) {
      const el = document.createElement(tag);
      if (classes.length) el.classList.add(...classes);
      Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    }
  
    render() {
      const card = this.createElement('article', ['recipe-card']);
      const content = this.createElement('div', ['recipe-card-content']);
  
      const title = this.createElement('h2', ['recipe-title']);
      title.textContent = this.recipe.nom;
  
      const img = this.createElement('img', ['recipe-image'], { src: this.recipe.image, alt: this.recipe.nom });
  
      const category = this.createElement('p', ['recipe-category']);
      category.textContent = this.recipe.categorie;
  
      const time = this.createElement('p', ['recipe-time']);
      time.textContent = `⏱ ${this.recipe.temps_preparation}`;
  
      // Bouton "Voir la recette"
      const viewButton = this.createElement('button', ['view-recipe-button']);
      viewButton.textContent = 'Voir la recette';
      viewButton.addEventListener('click', () => {
        // Déclenche un événement personnalisé avec la recette en détail
        document.dispatchEvent(new CustomEvent('viewRecipe', { detail: this.recipe }));
      });
  
      // Bouton favoris
      const favButton = this.createFavButton();
  
      const buttonsContainer = this.createElement('div', ['flex', 'justify-between', 'w-full', 'pb-3']);
      buttonsContainer.append(viewButton, favButton);
  
      content.append(title, img, category, time, buttonsContainer);
      card.appendChild(content);

      img.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('viewRecipe', { detail: this.recipe }));
      });
  
      return card;
    }
  
    createFavButton() {
    // Récupérer l'état actuel du favori via FavoriteManager
    const favorites = FavoriteManager.getFavorites();
    const isFavorite = favorites.find(fav => fav?.id === this.recipe.id);
    const fillColor = isFavorite ? 'red' : '#D3D3D3';

    const btn = this.createElement('button', ['favorite-button'], { 'data-recipe-id': this.recipe.id });
    btn.type = 'button';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fillColor}" class="w-4 h-4">
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
    `;
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Empêche le clic de se propager (pour ne pas ouvrir la modale)
      const isNowFavorite = FavoriteManager.toggleFavorite(this.recipe);
      // Met à jour l'affichage du bouton en fonction du nouvel état
      const svg = btn.querySelector('svg');
      svg.setAttribute('fill', isNowFavorite ? 'red' : '#D3D3D3');
      // Si vous êtes sur la page des favoris, vous pouvez réafficher la liste complète ici.
      // Par exemple, en déclenchant un événement ou en appelant une méthode de RecipeManager.
    });
    return btn;
  }
}

window.SearchManager = SearchManager;