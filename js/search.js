document.addEventListener('DOMContentLoaded', function () {
    
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('query');

    if (!searchTerm) return;

    const normalizeText = (text) => text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || '';
    const searchResultsContainer = document.getElementById("search-results-container");

    fetch("data/recipes.json")
        .then(response => response.json())
        .then(data => {
            const recipes = data.recettes;
            const results = recipes.filter(recipe => {
                const nameMatch = normalizeText(recipe.nom).includes(normalizeText(searchTerm));
                const ingredientMatch = recipe.ingredients.some(ing => normalizeText(ing.nom).includes(normalizeText(searchTerm)));
                return nameMatch || ingredientMatch;
            });

            if (results.length === 0) {
                searchResultsContainer.innerHTML = `<p>Aucune recette trouvée pour "${searchTerm}".</p>`;
            } else {
                searchResultsContainer.innerHTML = results.map(recipe => `
                    <div class="recipe-result">
                        <h3>${recipe.nom}</h3>
                        <p>${recipe.ingredients.map(ing => ing.nom).join(', ')}</p>
                    </div>
                `).join('');
            }
        })
        .catch(error => {
            console.error("Erreur de chargement des recettes:", error);
            searchResultsContainer.innerHTML = "<p>Impossible de charger les résultats.</p>";
        });
});
