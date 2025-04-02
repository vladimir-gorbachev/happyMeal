class RecipeCard {
  constructor(recipe, index) {
    this.recipe = recipe;
    this.index = index;
  }

  // Utilitaire pour créer des éléments
  createElement(tag, classes = [], attributes = {}, innerHTML = '') {
    const el = document.createElement(tag);
    if (classes.length) el.classList.add(...classes);
    Object.entries(attributes).forEach(([attr, value]) => el.setAttribute(attr, value));
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }

  // Créer le bouton favori
  createFavButton() {
    // Récupérer les favoris depuis localStorage
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const isFavorite = favorites.find(fav => fav.nom === this.recipe.nom);
    const fillColor = isFavorite ? 'red' : '#D3D3D3';

    const favButton = this.createElement(
      'button',
      [
        'favorite-button',
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
      { 'data-recipe-index': this.index }
    );
    favButton.type = 'button';
    favButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fillColor}" class="w-4 h-4">
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
    `;
    favButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFavorite();
    });
    return favButton;
  }

  // Méthode pour ajouter/supprimer un favori
  toggleFavorite() {
    const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const exists = favorites.find(fav => fav.nom === this.recipe.nom);

    if (exists) {
      favorites = favorites.filter(fav => fav.nom !== this.recipe.nom);
    } else {
      favorites.push(this.recipe);
    }
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    // Ici, tu peux déclencher un refresh de l'affichage si besoin
  }

  // Créer la carte recette
  createCard() {
    const card = this.createElement('article', [
      'bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 
      'w-full', 'md:w-[calc(33.333%-1rem)]', 'flex', 'flex-col'
    ]);
    
    const content = this.createElement('div', ['p-4', 'flex-grow', 'flex', 'flex-col']);

    const title = this.createElement('h2', ['font-bold', 'text-lg', 'mb-2']);
    title.textContent = this.recipe.nom;

    const img = this.createElement('img', ['w-4/5', 'h-40', 'object-cover', 'rounded'], { src: this.recipe.image, alt: this.recipe.nom });
    
    const category = this.createElement('h3', ['text-gray-600']);
    category.textContent = this.recipe.categorie;
    
    const time = this.createElement('p', ['text-gray-500']);
    time.textContent = `⏱ ${this.recipe.temps_preparation}`;
    
    const viewButton = this.createElement('button', ['viewRecipeButton']);
    viewButton.textContent = 'Voir la recette';
    viewButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openModal();
    });
    
    const favButton = this.createFavButton();
    
    const buttonsContainer = this.createElement('div', ['mt-auto', 'flex', 'justify-between', 'items-center'], {}, '');
    buttonsContainer.append(viewButton, favButton);
    
    content.append(title, img, category, time, buttonsContainer);
    card.appendChild(content);
    
    card.addEventListener('click', () => this.openModal());
    return card;
  }

  // Ouvrir la modale avec le détail de la recette
  openModal() {
    const modal = document.getElementById('recipeModal');
    modal.innerHTML = `
      <div class="p-4 flex-grow flex flex-col">
        <h2 class="font-bold pb-4">${this.recipe.nom}</h2>
        <figure class="flex">
          <img src="${this.recipe.image}" alt="${this.recipe.nom}" class="w-1/2 max-h-80 object-cover rounded p-4">
          <figcaption>
            <h3 class="pb-4"><span class="font-bold">Catégorie :</span> ${this.recipe.categorie}</h3>
            <p class="pb-4"><span class="font-bold">Temps de préparation :</span> ${this.recipe.temps_preparation}</p>
            <h3 class="font-bold">Ingrédients :</h3>
            <ul>
              ${this.recipe.ingredients.map(ingredient => {
                const escapedIngredient = ingredient.nom.replace(/'/g, "\\'");
                return `<li>${ingredient.nom}${ingredient.quantite ? ` - ${ingredient.quantite}` : ''} 
                        <button onclick="addToShoppingList('${escapedIngredient}', '${ingredient.quantite || '1'}')">Ajouter</button>
                        </li>`;
              }).join('')}
            </ul>
          </figcaption>
        </figure>
        <h3 class="font-bold">Étapes :</h3>
        <ol class="m-2">
          ${this.recipe.etapes.map((step, i) => `<li>${i + 1}. ${step}</li>`).join('')}
        </ol>
        <button class="btn rounded">Ajouter au planning</button>
      </div>
    `;
    modal.style.display = "flex";
    
    // Gestion de la fermeture de la modale (exemple simple)
    modal.querySelector('.btn').addEventListener('click', () => {
      modal.style.display = "none";
    });
  }
}

class RecipesPage {
  constructor(containerId, dataUrl) {
    this.container = document.getElementById(containerId);
    this.dataUrl = dataUrl;
    this.recipes = [];
  }

  async loadRecipes() {
    try {
      const response = await fetch(this.dataUrl);
      const data = await response.json();
      this.recipes = data.recettes;
      // Stocker toutes les recettes dans le localStorage pour toggleFavorite
      localStorage.setItem('recipes', JSON.stringify(this.recipes));
    } catch (error) {
      console.error("Erreur lors du chargement des recettes :", error);
    }
  }

  displayRecipes() {
    this.container.innerHTML = "";
    this.container.className = "flex flex-wrap gap-4 justify-center";
    this.recipes.forEach((recipe, index) => {
      const card = new RecipeCard(recipe, index).createCard();
      this.container.appendChild(card);
    });
  }

  async init() {
    await this.loadRecipes();
    this.displayRecipes();
  }
}

class FavoritesPage extends RecipesPage {
  // Pour la page des favoris, on surcharge le chargement pour utiliser uniquement le localStorage
  async loadRecipes() {
    this.recipes = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  }

  // On garde la méthode displayRecipes de la classe parente
  async init() {
    await this.loadRecipes();
    this.displayRecipes();
  }
}
