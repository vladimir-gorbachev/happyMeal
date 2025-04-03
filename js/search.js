document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('query')?.trim();

    // Conteneur des résultats
    const searchResultsContainer = document.getElementById("search-results-container");
    searchResultsContainer.className = "recipes-container";
    
    if (!searchTerm) {
        searchResultsContainer.innerHTML = `<p class="no-results">Veuillez entrer un terme de recherche valide.</p>`;
        return;
    }

    // Normalisation du texte
    const normalizeText = (text) => 
        text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || '';
    
    const normalizedSearchTerm = normalizeText(searchTerm);
    
    // Indicateur de chargement
    searchResultsContainer.innerHTML = `<p class="loading-message">Recherche en cours...</p>`;

    // Fonction pour créer une carte de recette
    function createRecipeCard(recipe, index) {
        const card = document.createElement('article');
        card.className = 'recipe-card';

        card.innerHTML = `
            <div class="recipe-card-content">
                <h2 class="recipe-title">${recipe.nom}</h2>
                <img class="recipe-image" src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.nom}">
                <p class="recipe-category">${recipe.categorie}</p>
                <p class="recipe-time">⏱ ${recipe.temps_preparation}</p>
                <div class="buttons-container">
                    <button class="view-recipe-button" data-index="${index}">Voir la recette</button>
                </div>
            </div>
        `;

        card.querySelector('.view-recipe-button').addEventListener('click', () => viewRecipe(index));
        return card;
    }

    // Fonction pour afficher le détail d'une recette dans la modale
    function viewRecipe(index) {
        const recipe = results[index];
        if (!recipe) return;

        const modal = document.getElementById('recipeDetails');
        modal.innerHTML = `
            <div class="modal-content">
            <button id="closeModal">X</button>
                <h2>${recipe.nom}</h2>
                <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.nom}">
                <p><strong>Catégorie:</strong> ${recipe.categorie}</p>
                <p><strong>Temps:</strong> ${recipe.temps_preparation}</p>
                <h3>Ingrédients:</h3>
                <ul>${recipe.ingredients.map(ing => `<li>${ing.nom} ${ing.quantite ? `- ${ing.quantite}` : ''}</li>`).join('')}</ul>
                <h3>Étapes:</h3>
                <ol>${recipe.etapes.map(step => `<li>${step}</li>`).join('')}</ol>
            </div>
        `;

        document.getElementById("modalOverlay").style.display = "flex";
        setTimeout(() => {
            const closeModalButton = document.getElementById("closeModal");
            if (closeModalButton) {
                closeModalButton.addEventListener("click", () => {
                    document.getElementById("modalOverlay").style.display = "none";
                });
            }
        }, 0);
    }


    // Chargement des recettes et recherche
    let results = [];
    (async () => {
        try {
            const response = await fetch("data/recipes.json");
            if (!response.ok) throw new Error('Erreur réseau');
            const data = await response.json();
            const recipes = data.recettes;

            // Filtrage des résultats
            results = recipes.filter(recipe => {
                const nameMatch = normalizeText(recipe.nom).includes(normalizedSearchTerm);
                const ingredientMatch = recipe.ingredients.some(ing => 
                    normalizeText(ing.nom).includes(normalizedSearchTerm));
                const descriptionMatch = normalizeText(recipe.description).includes(normalizedSearchTerm);
                return nameMatch || ingredientMatch || descriptionMatch;
            });

            // Affichage des résultats
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
