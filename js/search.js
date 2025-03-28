document.addEventListener('DOMContentLoaded', function () {
    
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('query');

    if (!searchTerm || typeof searchTerm !== 'string') return;

    const normalizeText = (text) => text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || '';
    const normalizedSearchTerm = normalizeText(searchTerm);
    const searchResultsContainer = document.getElementById("search-results-container");

    let cachedRecipes = null;

    const getRecipes = () => {
        if (cachedRecipes) return Promise.resolve(cachedRecipes);
        return fetch("data/recipes.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des données');
                }
                return response.json();
            })
            .then(data => {
                cachedRecipes = data.recettes;
                return cachedRecipes;
            });
    };

    getRecipes()
        .then(recipes => {
            const results = recipes.filter(recipe => {
                const nameMatch = normalizeText(recipe.nom).includes(normalizedSearchTerm);
                const ingredientMatch = recipe.ingredients.some(ing => normalizeText(ing.nom).includes(normalizedSearchTerm));
                return nameMatch || ingredientMatch;
            });

            if (results.length === 0) {
                searchResultsContainer.innerHTML = `<p>Aucune recette trouvée pour "${searchTerm}".</p>`;
            } else {
                const fragment = document.createDocumentFragment();
                results.forEach(recipe => {
                    const recipeDiv = document.createElement('div');
                    recipeDiv.className = "recipe-result";

                    const title = document.createElement('h3');
                    title.textContent = recipe.nom;
                    recipeDiv.appendChild(title);

                    const ingredients = document.createElement('p');
                    ingredients.textContent = recipe.ingredients.map(ing => ing.nom).join(', ');
                    recipeDiv.appendChild(ingredients);

                    fragment.appendChild(recipeDiv);
                });

                searchResultsContainer.innerHTML = '';
                searchResultsContainer.appendChild(fragment);
            }
        })
        .catch(error => {
            console.error("Erreur de chargement des recettes:", error);
            searchResultsContainer.innerHTML = "<p>Impossible de charger les résultats.</p>";
        });
});
