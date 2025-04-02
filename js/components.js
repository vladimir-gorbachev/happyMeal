// components.js

// Classe de base pour la création d'éléments DOM
export class BaseComponent {
  static createElement(tag, classes = [], attributes = {}, children = []) {
    const element = document.createElement(tag);
    if (classes.length) element.classList.add(...classes);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    children.forEach(child => element.appendChild(child));
    return element;
  }
}

// Composant pour créer une carte de recette
export class RecipeCard extends BaseComponent {
  constructor(recipe, index, { onView, onToggleFavorite } = {}) {
    super();
    this.recipe = recipe;
    this.index = index;
    this.onView = onView;
    this.onToggleFavorite = onToggleFavorite;
  }

  // Bouton favori (utilisé dans la carte et la modale)
  createFavButton() {
    // Récupérer les favoris depuis localStorage
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const isFavorite = favorites.find(fav => fav.nom === this.recipe.nom);
    const fillColor = isFavorite ? 'red' : '#D3D3D3';

    const favButton = BaseComponent.createElement(
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
    favButton.addEventListener('click', () => {
      if (typeof this.onToggleFavorite === 'function') {
        this.onToggleFavorite(this.index);
      }
    });
    return favButton;
  }

  // Crée et retourne l'élément de la carte
  render() {
    const card = BaseComponent.createElement('article', [
      'bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 
      'w-full', 'md:w-[calc(33.333%-1rem)]', 'min-h-[400px]', 'flex', 'flex-col'
    ]);

    const content = BaseComponent.createElement('div', ['p-4', 'flex-grow', 'flex', 'flex-col']);

    const title = BaseComponent.createElement('h2', ['font-bold', 'text-lg', 'mb-2', 'pb-2', 'line-clamp-2']);
    title.textContent = this.recipe.nom;

    const img = BaseComponent.createElement('img', ['h-60', 'object-cover', 'rounded', 'pt-6']);
    img.src = this.recipe.image;
    img.alt = this.recipe.nom;

    const category = BaseComponent.createElement('p', ['text-gray-600', 'mb-1']);
    category.textContent = this.recipe.categorie;

    const time = BaseComponent.createElement('p', ['text-gray-500', 'text-sm']);
    time.textContent = `⏱ ${this.recipe.temps_preparation}`;

    const viewButton = BaseComponent.createElement('button', ['viewRecipeButton']);
    viewButton.textContent = 'Voir la recette';
    viewButton.addEventListener('click', () => {
      if (typeof this.onView === 'function') {
        this.onView(this.index);
      }
    });

    const favButton = this.createFavButton();
    const buttonsContainer = BaseComponent.createElement('div', ['flex', 'justify-between'], {}, [viewButton, favButton]);

    content.append(title, img, category, time, buttonsContainer);
    card.appendChild(content);
    return card;
  }
}

// Composant pour la modale de détail d'une recette
export class RecipeModal extends BaseComponent {
  constructor(recipe, index, { onToggleFavorite, onAddToShoppingList } = {}) {
    super();
    this.recipe = recipe;
    this.index = index;
    this.onToggleFavorite = onToggleFavorite;
    this.onAddToShoppingList = onAddToShoppingList;
  }

  createFavButton() {
    // Même logique que dans RecipeCard
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const isFavorite = favorites.find(fav => fav.nom === this.recipe.nom);
    const fillColor = isFavorite ? 'red' : '#D3D3D3';

    const favButton = BaseComponent.createElement(
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
    favButton.addEventListener('click', () => {
      if (typeof this.onToggleFavorite === 'function') {
        this.onToggleFavorite(this.index);
      }
    });
    return favButton;
  }

  render() {
    const content = BaseComponent.createElement('div', ['p-4', 'flex-grow', 'flex', 'flex-col']);

    const title = BaseComponent.createElement('h2', ['font-bold', 'pb-4']);
    title.textContent = this.recipe.nom;

    const figure = BaseComponent.createElement('figure', ['flex', 'flex-wrap']);

    const img = BaseComponent.createElement('img', ['max-w-[400px]', 'max-h-[400px]', 'object-cover', 'rounded', 'p-4']);
    img.src = this.recipe.image;
    img.alt = this.recipe.nom;

    const figCaption = BaseComponent.createElement('figcaption', ['pl-3', 'max-w-[550px]', 'flex', 'justify-space-between', 'flex-wrap']);

    const category = BaseComponent.createElement('h3', ['pb-4']);
    category.innerHTML = `<span class="font-bold">Catégorie</span> : ${this.recipe.categorie}`;

    const time = BaseComponent.createElement('p', ['pb-4']);
    time.innerHTML = `<span class="font-bold">Temps de préparation:</span> ${this.recipe.temps_preparation}`;
    time.classList = "w-full pb-4";

    const ingredientsTitle = BaseComponent.createElement('h3', ['w-full', 'font-bold', 'pb-2']);
    ingredientsTitle.textContent = "Ingrédients:";

    const ingredientsList = BaseComponent.createElement('ul', ['w-full']);
    this.recipe.ingredients.forEach(ingredient => {
      const li = BaseComponent.createElement('li', ['w-full', 'flex', 'wrap', 'justify-between']);
      const ingredientSpan = BaseComponent.createElement('span');
      if (ingredient.quantite) {
        ingredientSpan.textContent = `${ingredient.quantite} - ${ingredient.nom}`;
      } else {
        ingredientSpan.textContent = ingredient;
      }
      const addToListButton = BaseComponent.createElement('button', ['ml-2', 'text-blue-500', 'button', 'rounded-xl','p-1', 'border']);
      addToListButton.textContent = 'Ajouter';
      addToListButton.addEventListener('click', () => {
        if (typeof this.onAddToShoppingList === 'function') {
          // On s'assure d'échapper les apostrophes
          const escapedIngredient = ingredient.nom.replace(/'/g, "\\'");
          this.onAddToShoppingList(escapedIngredient, ingredient.quantite || '1');
        }
      });
      li.append(ingredientSpan, addToListButton);
      ingredientsList.appendChild(li);
    });

    const stepsTitle = BaseComponent.createElement('h3', ['font-bold', 'mt-4']);
    stepsTitle.textContent = 'Étapes:';

    const stepsList = BaseComponent.createElement('ol', ['m-2', 'list-decimal', 'p-6']);
    this.recipe.etapes.forEach(step => {
      const li = BaseComponent.createElement('li', ['p-2']);
      li.textContent = step;
      stepsList.appendChild(li);
    });

    // Bouton favori repositionné pour la modale
    const favButton = this.createFavButton();
    favButton.classList.add('absolute', 'top-5', 'right-[45px]');

    figure.append(img, figCaption);
    figCaption.append(category, time, ingredientsTitle, ingredientsList);
    content.append(title, favButton, figure, stepsTitle, stepsList);

    return content;
  }
}
